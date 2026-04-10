import {
  formatChatTimestamp,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
  type ConversationMessage,
} from '@/components'

interface AppendAssistantDraftOptions {
  content: string
  messageId: string
  session: ChatSessionPreview
}

// 从响应头中解析当前实际命中的模型运行时信息。
export function parseRuntimeDebugInfoFromHeaders(
  headers: Headers
): ChatRuntimeDebugInfo {
  return {
    actualModel: decodeURIComponent(
      headers.get('x-mst-chat-actual-model') ?? ''
    ),
    displayTarget: decodeURIComponent(
      headers.get('x-mst-chat-display-target') ?? ''
    ),
    mode: headers.get('x-mst-chat-mode') === 'remote' ? 'remote' : 'local',
    provider:
      headers.get('x-mst-chat-provider') === 'deepseek' ? 'deepseek' : 'ollama',
    requestedModelId:
      headers.get('x-mst-chat-requested-model-id') === 'deepseek-reasoner'
        ? 'deepseek-reasoner'
        : 'deepseek-chat',
  }
}

// 将流式返回中的助手草稿写入会话，已存在则更新，不存在则追加。
export function appendAssistantDraftToSession({
  content,
  messageId,
  session,
}: AppendAssistantDraftOptions): ChatSessionPreview {
  const existingMessageIndex = session.messages.findIndex(
    (message) => message.id === messageId
  )

  const assistantDraftMessage: ConversationMessage = {
    id: messageId,
    role: 'assistant',
    label: 'AI 面试官',
    timestamp: formatChatTimestamp(),
    content,
  }

  const nextMessages =
    existingMessageIndex >= 0
      ? session.messages.map((message) =>
          message.id === messageId ? { ...message, content } : message
        )
      : [...session.messages, assistantDraftMessage]

  return {
    ...session,
    preview: content || session.preview,
    messages: nextMessages,
  }
}

// 生成一条统一的助手兜底错误消息。
export function createAssistantFallbackMessage(): ConversationMessage {
  return {
    id: `assistant-error-${Date.now()}`,
    role: 'assistant',
    label: 'AI 面试官',
    timestamp: formatChatTimestamp(),
    content:
      '抱歉，当前 AI 服务暂时不可用。你可以稍后再试，或先检查模型配置和 API Key 是否已经正确填写。',
  }
}
