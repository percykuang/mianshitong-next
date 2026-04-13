import type {
  ChatModelId,
  ChatRuntimeDebugInfo,
  ConversationMessage,
} from '@/components'
import { parseRuntimeDebugInfoFromHeaders } from './chat-message.utils'

interface StreamChatReplyOptions {
  history: Array<Pick<ConversationMessage, 'content' | 'role'>>
  message: string
  modelId: ChatModelId
  sessionId?: string
  onChunk?: (content: string) => void
  signal: AbortSignal
}

interface StreamChatReplyResult {
  content: string
  runtimeDebugInfo: ChatRuntimeDebugInfo
  sessionId: string | null
}

const FETCH_RETRY_DELAY_MS = 120

function createAbortError() {
  return new DOMException('The operation was aborted.', 'AbortError')
}

function isFetchTypeError(error: unknown) {
  return (
    error instanceof TypeError &&
    typeof error.message === 'string' &&
    /fetch/i.test(error.message)
  )
}

function normalizePersistedSessionId(sessionId: string | null) {
  return typeof sessionId === 'string' && sessionId.trim().length > 0
    ? sessionId.trim()
    : null
}

function waitForRetryDelay() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, FETCH_RETRY_DELAY_MS)
  })
}

// 调用聊天接口并按流式内容持续返回当前累计文本。
export async function streamChatReply({
  history,
  message,
  modelId,
  sessionId,
  onChunk,
  signal,
}: StreamChatReplyOptions): Promise<StreamChatReplyResult> {
  if (signal.aborted) {
    throw createAbortError()
  }

  let response: Response | null = null
  let lastFetchError: unknown = null

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          message,
          sessionId,
          history,
        }),
      })
      break
    } catch (error) {
      if (signal.aborted) {
        throw createAbortError()
      }

      lastFetchError = error

      if (!isFetchTypeError(error) || attempt === 1) {
        throw error
      }

      await waitForRetryDelay()
    }
  }

  if (!response) {
    throw lastFetchError ?? new Error('请求失败')
  }

  if (!response.ok || !response.body) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    throw new Error(data?.error || '请求失败')
  }

  const runtimeDebugInfo = parseRuntimeDebugInfoFromHeaders(response.headers)
  const persistedSessionId = normalizePersistedSessionId(
    response.headers.get('x-mst-chat-session-id')
  )
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let content = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        content += decoder.decode()
        break
      }

      content += decoder.decode(value, { stream: true })
      onChunk?.(content)
    }
  } catch (error) {
    if (signal.aborted) {
      throw createAbortError()
    }

    throw error
  }

  if (!content.trim()) {
    throw new Error('模型没有返回可展示的内容')
  }

  return {
    content,
    runtimeDebugInfo,
    sessionId: persistedSessionId,
  }
}
