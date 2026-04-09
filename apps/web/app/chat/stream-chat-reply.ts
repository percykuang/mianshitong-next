import type {
  ChatModelId,
  ChatRuntimeDebugInfo,
  ConversationMessage,
} from '@/components'
import { parseRuntimeDebugInfoFromHeaders } from './chat-controller.utils'

interface StreamChatReplyOptions {
  history: Array<Pick<ConversationMessage, 'content' | 'role'>>
  message: string
  modelId: ChatModelId
  onChunk?: (content: string) => void
  signal: AbortSignal
}

interface StreamChatReplyResult {
  content: string
  runtimeDebugInfo: ChatRuntimeDebugInfo
}

// 调用聊天接口并按流式内容持续返回当前累计文本。
export async function streamChatReply({
  history,
  message,
  modelId,
  onChunk,
  signal,
}: StreamChatReplyOptions): Promise<StreamChatReplyResult> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelId,
      message,
      history,
    }),
  })

  if (!response.ok || !response.body) {
    const data = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    throw new Error(data?.error || '请求失败')
  }

  const runtimeDebugInfo = parseRuntimeDebugInfoFromHeaders(response.headers)
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let content = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      content += decoder.decode()
      break
    }

    content += decoder.decode(value, { stream: true })
    onChunk?.(content)
  }

  if (!content.trim()) {
    throw new Error('模型没有返回可展示的内容')
  }

  return {
    content,
    runtimeDebugInfo,
  }
}
