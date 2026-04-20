import {
  type InterruptedSessionRecord,
  findInterruptedSessionRecord,
} from './query'
import {
  type ChatMessageCompletionStatus,
  chatPrisma,
  isSameAssistantReply,
  shouldRetryAssistantReplyWithoutCompletionStatus,
} from './shared'

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
    await chatPrisma.$transaction(async (tx) => {
      const assistantMessage = await tx.chatMessage.create({
        data: {
          sessionId: input.sessionId,
          role: 'assistant',
          content: input.content,
          completionStatus,
        },
        select: {
          id: true,
        },
      })

      await tx.chatSession.update({
        where: {
          id: input.sessionId,
        },
        data: {
          preview: input.content,
        },
      })

      if (shouldConsumeChatReplyQuota()) {
        await tx.chatReplyUsage.create({
          data: {
            actorId: input.actorId,
            assistantMessageId: assistantMessage.id,
          },
        })
      }
    })
  } catch (error) {
    if (!shouldRetryAssistantReplyWithoutCompletionStatus(error)) {
      throw error
    }

    console.warn(
      '[api/chat] persist assistant reply without completionStatus fallback'
    )

    await chatPrisma.$transaction(async (tx) => {
      const assistantMessage = await tx.chatMessage.create({
        data: {
          sessionId: input.sessionId,
          role: 'assistant',
          content: input.content,
        },
        select: {
          id: true,
        },
      })

      await tx.chatSession.update({
        where: {
          id: input.sessionId,
        },
        data: {
          preview: input.content,
        },
      })

      if (shouldConsumeChatReplyQuota()) {
        await tx.chatReplyUsage.create({
          data: {
            actorId: input.actorId,
            assistantMessageId: assistantMessage.id,
          },
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
