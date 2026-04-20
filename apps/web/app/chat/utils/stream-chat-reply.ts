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
  if (signal.aborted) {
    throw createAbortError()
  }

  let response: Response | null = null
  let lastFetchError: unknown = null

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
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
