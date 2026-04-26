import { normalizeChatModelId } from '@mianshitong/llm'

import {
  type EditableChatSessionRecord,
  findEditableSessionRecord,
} from './query'
import { type ChatPrismaTransactionClient, chatPrisma } from './shared'

export async function editUserMessageAndLoadConversation(input: {
  actorId: string
  message: string
  messageId: string
  sessionId: string
}) {
  const session = (await findEditableSessionRecord(
    input.actorId,
    input.sessionId
  )) as EditableChatSessionRecord | null

  if (!session) {
    return {
      error: 'session_not_found' as const,
    }
  }

  const targetIndex = session.messages.findIndex(
    (message: EditableChatSessionRecord['messages'][number]) =>
      message.id === input.messageId && message.role === 'user'
  )
  const lastEditableUserMessageId =
    [...session.messages]
      .reverse()
      .find(
        (message: EditableChatSessionRecord['messages'][number]) =>
          message.role === 'user'
      )?.id ?? null

  if (targetIndex < 0 || lastEditableUserMessageId !== input.messageId) {
    return {
      error: 'message_not_editable' as const,
    }
  }

  const trailingMessageIds = session.messages
    .slice(targetIndex + 1)
    .map((message: EditableChatSessionRecord['messages'][number]) => message.id)
  const conversation = session.messages
    .slice(0, targetIndex + 1)
    .map(
      (
        message: EditableChatSessionRecord['messages'][number],
        index: number
      ) => ({
        role: message.role,
        content: index === targetIndex ? input.message : message.content,
      })
    )

  await chatPrisma.$transaction(async (tx: ChatPrismaTransactionClient) => {
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
      },
    })
  })

  return {
    conversation,
    error: null,
    chatModelId: normalizeChatModelId(session.modelId),
    sessionId: session.id,
  }
}
