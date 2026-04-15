import { type ChatActor } from '@/server/chat-actor'
import { type ChatModelId } from '@mianshitong/providers'
import { chatPrisma, createChatSessionTitle } from './shared'

export async function findOrCreateChatSession(input: {
  actor: ChatActor
  message: string
  normalizedModelId: ChatModelId
  normalizedSessionId: string | null
}) {
  if (input.normalizedSessionId !== null) {
    const existingSession = await chatPrisma.chatSession.findFirst({
      where: {
        id: input.normalizedSessionId,
        actorId: input.actor.id,
      },
      select: {
        id: true,
      },
    })

    if (existingSession) {
      return existingSession
    }
  }

  return chatPrisma.chatSession.create({
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
