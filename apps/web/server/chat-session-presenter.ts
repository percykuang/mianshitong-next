import type { ChatSessionPreview, ConversationMessage } from '@/components'
import { formatChatTimestamp } from '@/components'

export interface PersistedChatMessage {
  content: string
  completionStatus: 'completed' | 'interrupted' | null
  createdAt: Date
  feedback: 'dislike' | 'like' | null
  id: string
  role: 'assistant' | 'user'
}

export interface PersistedChatSessionWithMessages {
  createdAt: Date
  id: string
  messages: PersistedChatMessage[]
  pinned: boolean
  pinnedAt: Date | null
  preview: string
  title: string
  updatedAt: Date
}

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
