import {
  createChatSessionTitle,
  formatChatTimestamp,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
  type ConversationMessage,
} from '@/components'

interface CreateNextSessionOptions {
  input: string
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
}

interface AppendAssistantDraftOptions {
  content: string
  messageId: string
  session: ChatSessionPreview
}

// 将会话提升到列表顶部，保持会话列表的最近使用顺序。
export function upsertSessionToTop(
  currentSessions: ChatSessionPreview[],
  session: ChatSessionPreview
) {
  return [session, ...currentSessions.filter((item) => item.id !== session.id)]
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

// 根据当前输入创建一条新的用户消息。
export function createUserMessage(input: string): ConversationMessage {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    label: '你',
    timestamp: formatChatTimestamp(),
    content: input,
  }
}

// 基于当前输入和已选会话构造下一次对话所使用的会话快照。
export function createNextSession({
  input,
  selectedSessionId,
  sessions,
}: CreateNextSessionOptions): ChatSessionPreview {
  const nextSessionId = selectedSessionId ?? `session-${Date.now()}`
  const baseSession =
    sessions.find((session) => session.id === nextSessionId) ?? null
  const userMessage = createUserMessage(input)

  return {
    id: nextSessionId,
    title: baseSession?.title ?? createChatSessionTitle(input),
    preview: input,
    pinned: baseSession?.pinned,
    messages: [...(baseSession?.messages ?? []), userMessage],
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
