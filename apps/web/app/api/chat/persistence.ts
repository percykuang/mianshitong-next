import { prisma } from '@mianshitong/db'
import { type ChatModelId } from '@mianshitong/providers'
import { type ChatActor } from '@/server/chat-actor'
import { type ChatRequestMessage } from './request'

interface ChatSessionRecordId {
  id: string
}

interface ChatPrismaTransactionClient {
  chatMessage: {
    create(args: {
      data: {
        content: string
        role: 'assistant' | 'user'
        sessionId: string
      }
    }): Promise<unknown>
    findMany(args: {
      where: {
        sessionId: string
      }
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
      select: {
        content: true
        role: true
      }
    }): Promise<ChatRequestMessage[]>
  }
  chatSession: {
    update(args: {
      where: {
        id: string
      }
      data: {
        modelId?: string
        preview: string
      }
    }): Promise<unknown>
  }
}

interface ChatPrismaClient {
  chatSession: {
    create(args: {
      data: {
        actorId: string
        modelId: string
        preview: string
        title: string
        userId?: string
      }
      select: {
        id: true
      }
    }): Promise<ChatSessionRecordId>
    findFirst(args: {
      where: {
        actorId: string
        id: string
      }
      select: {
        id: true
      }
    }): Promise<ChatSessionRecordId | null>
  }
  $transaction<T>(
    fn: (tx: ChatPrismaTransactionClient) => Promise<T>
  ): Promise<T>
}

const chatPrisma = prisma as unknown as ChatPrismaClient

function createChatSessionTitle(input: string) {
  return input.trim().slice(0, 18) || '新的面试对话'
}

export async function findOrCreateChatSession(input: {
  actor: ChatActor
  message: string
  normalizedModelId: ChatModelId
  normalizedSessionId: string | null
}) {
  return input.normalizedSessionId === null
    ? chatPrisma.chatSession.create({
        data: {
          actorId: input.actor.id,
          ...(input.actor.authUserId ? { userId: input.actor.authUserId } : {}),
          modelId: input.normalizedModelId,
          title: createChatSessionTitle(input.message),
          preview: input.message,
        },
        select: {
          id: true,
        },
      })
    : chatPrisma.chatSession.findFirst({
        where: {
          id: input.normalizedSessionId,
          actorId: input.actor.id,
        },
        select: {
          id: true,
        },
      })
}

export async function persistUserMessageAndLoadConversation(input: {
  message: string
  normalizedModelId: ChatModelId
  sessionId: string
}) {
  return chatPrisma.$transaction(async (tx) => {
    await tx.chatMessage.create({
      data: {
        sessionId: input.sessionId,
        role: 'user',
        content: input.message,
      },
    })

    await tx.chatSession.update({
      where: {
        id: input.sessionId,
      },
      data: {
        modelId: input.normalizedModelId,
        preview: input.message,
      },
    })

    return tx.chatMessage.findMany({
      where: {
        sessionId: input.sessionId,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        role: true,
        content: true,
      },
    })
  })
}

export async function persistAssistantReply(
  sessionId: string,
  content: string
) {
  if (!content.trim()) {
    return
  }

  await chatPrisma.$transaction(async (tx) => {
    await tx.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content,
      },
    })

    await tx.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        preview: content,
      },
    })
  })
}
