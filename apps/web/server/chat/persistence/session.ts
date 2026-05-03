import type { ChatActor } from '@/server/chat/actor'

import {
  type ChatDbTransaction,
  chatDb,
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
  chatModelId: string
  normalizedSessionId: string | null
}): Promise<FindOrCreateChatSessionResult> {
  if (input.normalizedSessionId !== null) {
    const existingSession = await chatDb.chatSession.findIdentityById(
      input.normalizedSessionId
    )

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

  const session = await chatDb.chatSession.create({
    actorId: input.actor.id,
    id: input.normalizedSessionId ?? undefined,
    modelId: input.chatModelId,
    preview: input.message,
    title: createChatSessionTitle(),
    titleSource: 'fallback',
    userId: input.actor.authUserId,
  })

  return {
    error: null,
    session,
  }
}

export async function persistUserMessageAndLoadConversation(input: {
  message: string
  chatModelId: string
  sessionId: string
}) {
  return chatDb.transaction(async (tx: ChatDbTransaction) => {
    await tx.chatMessage.createUser({
      sessionId: input.sessionId,
      content: input.message,
    })

    await tx.chatSession.updateById({
      sessionId: input.sessionId,
      modelId: input.chatModelId,
      preview: input.message,
    })

    return tx.chatMessage.listConversationBySessionId(input.sessionId)
  })
}
