import {
  type ChatMessageCompletionStatus,
  type ChatSessionPreview,
  type ConversationMessage,
  formatChatTimestamp,
} from '@/app/chat/domain'

interface AppendAssistantDraftOptions {
  content: string
  messageId: string
  session: ChatSessionPreview
}

interface BuildOptimisticEditedSessionOptions {
  content: string
  messageId: string
  session: ChatSessionPreview
}

// 将流式返回中的助手草稿写入会话，已存在则更新，不存在则追加。
export function appendAssistantDraftToSession({
  content,
  messageId,
  session,
}: AppendAssistantDraftOptions): ChatSessionPreview {
  const now = Date.now()
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
          message.id === messageId
            ? {
                ...message,
                content,
                completionStatus: undefined,
              }
            : message
        )
      : [...session.messages, assistantDraftMessage]

  return {
    ...session,
    preview: content || session.preview,
    updatedAt: now,
    messages: nextMessages,
  }
}

export function projectAssistantReplyOntoSession(input: {
  content: string
  messageId: string
  session: ChatSessionPreview
}) {
  if (!input.content.trim()) {
    return input.session
  }

  return appendAssistantDraftToSession(input)
}

export function finalizeAssistantMessageInSession(input: {
  completionStatus: ChatMessageCompletionStatus
  messageId: string
  session: ChatSessionPreview
}) {
  const now = Date.now()
  const nextMessages = input.session.messages
    .filter((message) => {
      if (message.id !== input.messageId) {
        return true
      }

      return message.content.trim().length > 0
    })
    .map((message) =>
      message.id === input.messageId
        ? {
            ...message,
            completionStatus: input.completionStatus,
          }
        : message
    )

  return {
    ...input.session,
    updatedAt: now,
    messages: nextMessages,
  }
}

export function finalizeReplyToSession(input: {
  completionStatus: ChatMessageCompletionStatus
  content: string
  messageId: string
  session: ChatSessionPreview
}) {
  if (!input.content.trim()) {
    return input.session
  }

  return finalizeAssistantMessageInSession({
    completionStatus: input.completionStatus,
    messageId: input.messageId,
    session: projectAssistantReplyOntoSession({
      content: input.content,
      messageId: input.messageId,
      session: input.session,
    }),
  })
}

export function buildOptimisticEditedSession({
  content,
  messageId,
  session,
}: BuildOptimisticEditedSessionOptions): ChatSessionPreview | null {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return null
  }

  const targetIndex = session.messages.findIndex(
    (message) => message.id === messageId && message.role === 'user'
  )
  const lastEditableUserMessageId =
    [...session.messages].reverse().find((message) => message.role === 'user')
      ?.id ?? null

  if (targetIndex < 0 || lastEditableUserMessageId !== messageId) {
    return null
  }

  const targetMessage = session.messages[targetIndex]

  if (!targetMessage) {
    return null
  }

  return {
    ...session,
    title: session.title,
    preview: normalizedContent,
    updatedAt: Date.now(),
    messages: [
      ...session.messages.slice(0, targetIndex),
      {
        ...targetMessage,
        content: normalizedContent,
      },
    ],
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
