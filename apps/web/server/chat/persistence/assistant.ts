import {
  chatPrisma,
  isSameAssistantReply,
  shouldRetryAssistantReplyWithoutCompletionStatus,
  type ChatMessageCompletionStatus,
} from './shared'
import {
  findInterruptedSessionRecord,
  type InterruptedSessionRecord,
} from './query'

export async function persistAssistantReply(
  sessionId: string,
  content: string,
  completionStatus: ChatMessageCompletionStatus = 'completed'
) {
  if (!content.trim()) {
    return
  }

  try {
    await chatPrisma.$transaction(async (tx) => {
      await tx.chatMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content,
          completionStatus,
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
  } catch (error) {
    if (!shouldRetryAssistantReplyWithoutCompletionStatus(error)) {
      throw error
    }

    console.warn(
      '[api/chat] persist assistant reply without completionStatus fallback'
    )

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

  await persistAssistantReply(session.id, input.content, 'interrupted')

  return {
    error: null,
    sessionId: session.id,
  }
}
