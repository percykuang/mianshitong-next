import { resolveUsableChatModelId } from '../application/model-catalog'
import {
  type EditableChatSessionRecord,
  findEditableSessionRecord,
} from './query'
import { type ChatDbTransaction, chatDb } from './shared'

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

  await chatDb.transaction(async (tx: ChatDbTransaction) => {
    await tx.chatMessage.updateContent({
      messageId: input.messageId,
      content: input.message,
    })

    await tx.chatMessage.deleteManyByIds(trailingMessageIds)

    await tx.chatSession.updateById({
      sessionId: session.id,
      preview: input.message,
    })
  })

  const chatModelId = await resolveUsableChatModelId(session.modelId)

  if (chatModelId.error) {
    return {
      error: chatModelId.error,
    }
  }

  return {
    conversation,
    error: null,
    chatModelId: chatModelId.modelId,
    sessionId: session.id,
  }
}
