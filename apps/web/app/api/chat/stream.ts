import { getChatModel, getChatModelRuntimeInfo } from '@mianshitong/providers'
import { persistAssistantReply } from '@/server/chat/persistence'

const SYSTEM_PROMPT = `你是面试通的 AI 面试助手。

你的任务是围绕求职、面试、简历优化、项目表达、技术追问这些主题，给出清晰、具体、可执行的中文回答。

回答要求：
1. 默认使用简体中文。
2. 优先直接回答问题，再给结构化建议。
3. 如果用户的问题适合列表化表达，可以自然使用 Markdown。
4. 不要编造不存在的经历、项目或数据；如果信息不足，明确指出并引导用户补充。
5. 输出尽量适合聊天场景，避免过度冗长。`

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
            content: SYSTEM_PROMPT,
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

        await persistAssistantReply(
          input.persistedSessionId,
          assistantContent,
          'completed'
        )

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
