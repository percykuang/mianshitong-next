import type { ChatModelId } from '@mianshitong/providers/model/types'

import type { ChatActor } from '@/server/chat/actor'

import { CHAT_MESSAGE_ORDER_BY } from './query'
import { chatPrisma, createChatSessionTitle } from './shared'

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
  normalizedModelId: ChatModelId
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
      modelId: input.normalizedModelId,
      title: createChatSessionTitle(input.message),
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
      orderBy: CHAT_MESSAGE_ORDER_BY,
      select: {
        role: true,
        content: true,
      },
    })
  })
}
