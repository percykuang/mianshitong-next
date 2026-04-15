import { normalizeChatModelId } from '@mianshitong/providers'
import {
  chatPrisma,
  createChatSessionTitle,
  type EditableChatSessionRecord,
} from './shared'

export async function editUserMessageAndLoadConversation(input: {
  actorId: string
  message: string
  messageId: string
  sessionId: string
}) {
  const session = (await chatPrisma.chatSession.findFirst({
    where: {
      id: input.sessionId,
      actorId: input.actorId,
    },
    select: {
      id: true,
      modelId: true,
      messages: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          role: true,
          content: true,
        },
      },
    },
  })) as EditableChatSessionRecord | null

  if (!session) {
    return {
      error: 'session_not_found' as const,
    }
  }

  const targetIndex = session.messages.findIndex(
    (message) => message.id === input.messageId && message.role === 'user'
  )
  const lastEditableUserMessageId =
    [...session.messages].reverse().find((message) => message.role === 'user')
      ?.id ?? null

  if (targetIndex < 0 || lastEditableUserMessageId !== input.messageId) {
    return {
      error: 'message_not_editable' as const,
    }
  }

  const trailingMessageIds = session.messages
    .slice(targetIndex + 1)
    .map((message) => message.id)
  const firstUserMessageIndex = session.messages.findIndex(
    (message) => message.role === 'user'
  )
  const conversation = session.messages
    .slice(0, targetIndex + 1)
    .map((message, index) => ({
      role: message.role,
      content: index === targetIndex ? input.message : message.content,
    }))

  await chatPrisma.$transaction(async (tx) => {
    await tx.chatMessage.update({
      where: {
        id: input.messageId,
      },
      data: {
        content: input.message,
      },
    })

    if (trailingMessageIds.length > 0) {
      await tx.chatMessage.deleteMany({
        where: {
          id: {
            in: trailingMessageIds,
          },
        },
      })
    }

    await tx.chatSession.update({
      where: {
        id: session.id,
      },
      data: {
        preview: input.message,
        ...(targetIndex === firstUserMessageIndex
          ? { title: createChatSessionTitle(input.message) }
          : {}),
      },
    })
  })

  return {
    conversation,
    error: null,
    normalizedModelId: normalizeChatModelId(session.modelId),
    sessionId: session.id,
  }
}
