import {
  formatChatTimestamp,
  type ChatSessionPreview,
  type ConversationMessage,
} from '@/app/chat/domain'
import type {
  PersistedChatMessage,
  PersistedChatSessionWithMessages,
} from './query'

const MESSAGE_LABEL_BY_ROLE: Record<PersistedChatMessage['role'], string> = {
  user: '你',
  assistant: 'AI 面试官',
}

export function toConversationMessage(
  message: PersistedChatMessage
): ConversationMessage {
  return {
    id: message.id,
    role: message.role,
    label: MESSAGE_LABEL_BY_ROLE[message.role],
    timestamp: formatChatTimestamp(message.createdAt),
    content: message.content,
    completionStatus: message.completionStatus ?? undefined,
    feedback: message.feedback ?? undefined,
  }
}

export function toChatSessionPreview(
  session: PersistedChatSessionWithMessages
): ChatSessionPreview {
  return {
    id: session.id,
    title: session.title,
    preview: session.preview,
    pinned: session.pinned,
    pinnedAt: session.pinnedAt?.getTime(),
    createdAt: session.createdAt.getTime(),
    updatedAt: session.updatedAt.getTime(),
    messages: session.messages.map(toConversationMessage),
  }
}
