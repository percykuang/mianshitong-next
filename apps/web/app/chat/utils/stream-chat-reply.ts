import { isFetchTypeError, parseJsonSafely } from '@mianshitong/shared'

import type {
  ChatRequestBody,
  ChatRequestMessage,
  EditMessageBody,
  StreamMessageBody,
} from '@/app/chat/contracts'
import type { ChatModelId, ChatRuntimeDebugInfo } from '@/app/chat/domain'

import { parseRuntimeDebugInfoFromHeaders } from './chat-message.utils'

interface StreamChatReplyOptions {
  history: ChatRequestMessage[]
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

interface StreamEditedChatReplyOptions {
  content: string
  messageId: string
  onChunk?: (content: string) => void
  sessionId: string
  signal: AbortSignal
}

const FETCH_RETRY_DELAY_MS = 120

function createAbortError() {
  return new DOMException('The operation was aborted.', 'AbortError')
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

async function readStreamedChatReply(
  response: Response,
  signal: AbortSignal,
  onChunk?: (content: string) => void
): Promise<StreamChatReplyResult> {
  if (!response.ok || !response.body) {
    const data = await parseJsonSafely<{
      error?: string
    }>(response)

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

// 调用聊天接口并按流式内容持续返回当前累计文本。
export async function streamChatReply({
  history,
  message,
  modelId,
  sessionId,
  onChunk,
  signal,
}: StreamChatReplyOptions): Promise<StreamChatReplyResult> {
  // 请求发出前先检查中断状态，避免在已取消的情况下继续进入网络层。
  if (signal.aborted) {
    throw createAbortError()
  }

  let response: Response | null = null
  let lastFetchError: unknown = null

  // 对瞬时网络错误做一次轻量重试，尽量覆盖偶发 fetch 失败，
  // 但不做更激进的重试策略，避免重复发送带来更复杂的副作用。
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      // 持久化会话模式下，只需提交当前消息内容，服务端会自行从数据库补全上下文；
      // 非持久化模式下，则要把前端维护的 history 一并传给 /api/chat。
      const payload: ChatRequestBody | StreamMessageBody = sessionId
        ? {
            content: message,
            modelId,
          }
        : {
            history,
            message,
            modelId,
            sessionId,
          }

      // 根据是否已有 sessionId，切到不同的服务端入口。
      response = await fetch(
        sessionId
          ? `/api/chat/sessions/${sessionId}/messages/stream`
          : '/api/chat',
        {
          method: 'POST',
          signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )
      break
    } catch (error) {
      // 如果是用户主动中断，优先抛出统一的 AbortError，交给上层收口。
      if (signal.aborted) {
        throw createAbortError()
      }

      lastFetchError = error

      // 只对真正的 fetch 网络错误做重试；业务错误和最后一次失败直接向上抛出。
      if (!isFetchTypeError(error) || attempt === 1) {
        throw error
      }

      // 给浏览器和网络层一个很短的恢复窗口，再尝试一次。
      await waitForRetryDelay()
    }
  }

  if (!response) {
    throw lastFetchError ?? new Error('请求失败')
  }

  // 统一在这里消费流式响应、累计文本，并通过 onChunk 回推给上层更新 UI。
  return readStreamedChatReply(response, signal, onChunk)
}

export async function streamEditedChatReply({
  content,
  messageId,
  onChunk,
  sessionId,
  signal,
}: StreamEditedChatReplyOptions): Promise<StreamChatReplyResult> {
  if (signal.aborted) {
    throw createAbortError()
  }

  const payload: EditMessageBody = {
    content,
  }

  const response = await fetch(
    `/api/chat/sessions/${sessionId}/messages/${messageId}/edit/stream`,
    {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  return readStreamedChatReply(response, signal, onChunk)
}
