import type { ChatModelId } from '@mianshitong/llm'

import type { ChatActor } from '@/server/chat/actor'

import { CHAT_MESSAGE_ORDER_BY } from './query'
import {
  type ChatPrismaTransactionClient,
  chatPrisma,
  createChatSessionTitle,
} from './shared'

type FindOrCreateChatSessionResult =
  | {
      error: null
      session: {
        id: string
      }
    }
  | {
      error: 'session_not_found'
      session: null
    }

export async function findOrCreateChatSession(input: {
  actor: ChatActor
  message: string
  chatModelId: ChatModelId
  normalizedSessionId: string | null
}): Promise<FindOrCreateChatSessionResult> {
  if (input.normalizedSessionId !== null) {
    const existingSession = await chatPrisma.chatSession.findUnique({
      where: {
        id: input.normalizedSessionId,
      },
      select: {
        actorId: true,
        id: true,
      },
    })

    if (existingSession) {
      return existingSession.actorId === input.actor.id
        ? {
            error: null,
            session: {
              id: existingSession.id,
            },
          }
        : {
            error: 'session_not_found',
            session: null,
          }
    }
  }

  const session = await chatPrisma.chatSession.create({
    data: {
      actorId: input.actor.id,
      ...(input.actor.authUserId ? { userId: input.actor.authUserId } : {}),
      ...(input.normalizedSessionId ? { id: input.normalizedSessionId } : {}),
      modelId: input.chatModelId,
      title: createChatSessionTitle(),
      preview: input.message,
    },
    select: {
      id: true,
    },
  })

  return {
    error: null,
    session,
  }
}

export async function persistUserMessageAndLoadConversation(input: {
  message: string
  chatModelId: ChatModelId
  sessionId: string
}) {
  return chatPrisma.$transaction(async (tx: ChatPrismaTransactionClient) => {
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
        modelId: input.chatModelId,
        preview: input.message,
      },
    })

    return tx.chatMessage.findMany({
      where: {
        sessionId: input.sessionId,
      },
      orderBy: CHAT_MESSAGE_ORDER_BY,
      select: {
        role: true,
        content: true,
      },
    })
  })
}
