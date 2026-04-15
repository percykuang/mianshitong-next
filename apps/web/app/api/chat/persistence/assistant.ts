import {
  chatPrisma,
  isSameAssistantReply,
  shouldRetryAssistantReplyWithoutCompletionStatus,
  type ChatMessageCompletionStatus,
  type EditableChatMessageRecord,
} from './shared'

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
  const session = (await chatPrisma.chatSession.findFirst({
    where: {
      id: input.sessionId,
      actorId: input.actorId,
    },
    select: {
      id: true,
      messages: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          completionStatus: true,
          id: true,
          role: true,
          content: true,
        },
      },
    },
  })) as {
    id: string
    messages: EditableChatMessageRecord[]
  } | null

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
      error: null,
      sessionId: session.id,
    }
  }

  await persistAssistantReply(session.id, input.content, 'interrupted')

  return {
    error: null,
    sessionId: session.id,
  }
}
