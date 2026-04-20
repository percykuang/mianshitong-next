import { getChatModel, getChatModelRuntimeInfo } from '@mianshitong/providers'
import { persistAssistantReply } from '@/server/chat/persistence'
import { CHAT_REPLY_POLICY_INSTRUCTION } from '@/server/chat/policy'

function normalizeContent(
  content:
    | string
    | Array<string | { text?: string; type?: string }>
    | null
    | undefined
) {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (typeof part?.text === 'string') {
        return part.text
      }

      return ''
    })
    .join('')
}

function normalizeChunkText(
  chunk:
    | {
        content?:
          | string
          | Array<string | { text?: string; type?: string }>
          | null
          | undefined
        text?: string
      }
    | null
    | undefined
) {
  const normalizedContent = normalizeContent(chunk?.content)

  if (normalizedContent) {
    return normalizedContent
  }

  return typeof chunk?.text === 'string' ? chunk.text : ''
}

function closeReadableStreamController(
  controller: ReadableStreamDefaultController
) {
  try {
    controller.close()
  } catch (error) {
    if (
      !(error instanceof TypeError) ||
      !error.message.includes('Controller is already closed')
    ) {
      throw error
    }
  }
}

export function createChatStreamHeaders(input: {
  persistedSessionId: string
  runtime: ReturnType<typeof getChatModelRuntimeInfo>
}) {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'x-mst-chat-actual-model': encodeURIComponent(input.runtime.actualModel),
    'x-mst-chat-display-target': encodeURIComponent(
      input.runtime.displayTarget
    ),
    'x-mst-chat-mode': input.runtime.mode,
    'x-mst-chat-provider': input.runtime.provider,
    'x-mst-chat-requested-model-id': input.runtime.requestedModelId,
    'x-mst-chat-session-id': input.persistedSessionId,
  }
}

export function createChatResponseStream(input: {
  actorId: string
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  model: ReturnType<typeof getChatModel>
  persistedSessionId: string
  requestSignal: AbortSignal
}) {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        let assistantContent = ''
        const outputStream = await input.model.stream([
          {
            role: 'system',
            content: CHAT_REPLY_POLICY_INSTRUCTION,
          },
          ...input.conversation,
        ])

        for await (const chunk of outputStream) {
          if (input.requestSignal.aborted) {
            return
          }

          const text = normalizeChunkText(chunk)

          if (!text) {
            continue
          }

          assistantContent += text
          controller.enqueue(encoder.encode(text))
        }

        await persistAssistantReply({
          actorId: input.actorId,
          completionStatus: 'completed',
          content: assistantContent,
          sessionId: input.persistedSessionId,
        })

        closeReadableStreamController(controller)
      } catch (error) {
        if (input.requestSignal.aborted) {
          return
        }

        console.error('[api/chat] model stream failed', error)
        controller.error(error)
      }
    },
  })
}
