import { createLogger } from '@mianshitong/shared/runtime'

import {
  type InterruptedSessionRecord,
  findInterruptedSessionRecord,
} from './query'
import {
  type ChatDbTransaction,
  type ChatMessageCompletionStatus,
  chatDb,
  isSameAssistantReply,
  shouldRetryAssistantReplyWithoutCompletionStatus,
} from './shared'

const logger = createLogger('web.chat.persistence.assistant')

function shouldConsumeChatReplyQuota() {
  return true
}

export async function persistAssistantReply(input: {
  actorId: string
  content: string
  completionStatus?: ChatMessageCompletionStatus
  sessionId: string
}) {
  if (!input.content.trim()) {
    return
  }

  const completionStatus = input.completionStatus ?? 'completed'

  try {
    await chatDb.transaction(async (tx: ChatDbTransaction) => {
      const assistantMessage = await tx.chatMessage.createAssistant({
        sessionId: input.sessionId,
        content: input.content,
        completionStatus,
      })

      await tx.chatSession.updateById({
        sessionId: input.sessionId,
        preview: input.content,
      })

      if (shouldConsumeChatReplyQuota()) {
        await tx.userActor.createReplyUsage({
          actorId: input.actorId,
          assistantMessageId: assistantMessage.id,
        })
      }
    })
  } catch (error) {
    if (!shouldRetryAssistantReplyWithoutCompletionStatus(error)) {
      throw error
    }

    logger.warn('persist assistant reply without completionStatus fallback')

    await chatDb.transaction(async (tx: ChatDbTransaction) => {
      const assistantMessage = await tx.chatMessage.createAssistant({
        sessionId: input.sessionId,
        content: input.content,
      })

      await tx.chatSession.updateById({
        sessionId: input.sessionId,
        preview: input.content,
      })

      if (shouldConsumeChatReplyQuota()) {
        await tx.userActor.createReplyUsage({
          actorId: input.actorId,
          assistantMessageId: assistantMessage.id,
        })
      }
    })
  }
}

export async function persistInterruptedAssistantReply(input: {
  actorId: string
  content: string
  expectedMessageCount: number
  sessionId: string
}) {
  const session = (await findInterruptedSessionRecord(
    input.actorId,
    input.sessionId
  )) as InterruptedSessionRecord | null

  if (!session) {
    return {
      error: 'session_not_found' as const,
    }
  }

  if (session.messages.length !== input.expectedMessageCount) {
    const lastMessage = session.messages[session.messages.length - 1] ?? null

    if (
      session.messages.length === input.expectedMessageCount + 1 &&
      isSameAssistantReply(lastMessage, input.content)
    ) {
      return {
        error: null,
        sessionId: session.id,
      }
    }

    return {
      error: 'message_count_mismatch' as const,
    }
  }

  await persistAssistantReply({
    actorId: input.actorId,
    completionStatus: 'interrupted',
    content: input.content,
    sessionId: session.id,
  })

  return {
    error: null,
    sessionId: session.id,
  }
}
