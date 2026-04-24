import type { Logger } from '@mianshitong/shared/runtime'

import { chatRouteError, chatServiceUnavailableError } from './errors'
import { createChatResponseStream, createChatStreamHeaders } from './stream'

interface ChatReplyActor {
  id: string
}

interface ChatReplyResult {
  error: 'message_not_editable' | 'quota_exceeded' | 'session_not_found' | null
  reply: {
    conversation: Array<{ content: string; role: 'assistant' | 'user' }>
    model: Parameters<typeof createChatResponseStream>[0]['model']
    persistedSessionId: string
    resolveWorkflowContext: Parameters<
      typeof createChatResponseStream
    >[0]['resolveWorkflowContext']
  } | null
}

export async function createChatReplyStreamResponse(input: {
  actor: ChatReplyActor
  logger: Logger
  requestSignal: AbortSignal
  resolveReply: () => Promise<ChatReplyResult>
}) {
  try {
    const result = await input.resolveReply()

    if (result.error) {
      return chatRouteError(result.error)
    }

    if (!result.reply) {
      return chatServiceUnavailableError()
    }

    const { conversation, model, persistedSessionId, resolveWorkflowContext } =
      result.reply
    const stream = createChatResponseStream({
      actorId: input.actor.id,
      conversation,
      model,
      persistedSessionId,
      requestSignal: input.requestSignal,
      resolveWorkflowContext,
    })

    return new Response(stream, {
      headers: createChatStreamHeaders({
        persistedSessionId,
      }),
    })
  } catch (error) {
    input.logger.error('model invoke failed', error)

    return chatServiceUnavailableError()
  }
}
