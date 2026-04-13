import type {
  ChatModelId,
  ChatModelOption,
  ChatModelRuntimeInfo,
} from '@mianshitong/providers'

export interface ConversationMessage {
  id: string
  role: 'assistant' | 'user'
  label: string
  timestamp: string
  content: string
  feedback?: ChatMessageFeedback
  points?: string[]
}

export type ChatMessageFeedback = 'dislike' | 'like'

export interface ChatSessionPreview {
  createdAt: number
  id: string
  pinnedAt?: number
  title: string
  preview: string
  pinned?: boolean
  messages: ConversationMessage[]
}

export interface ChatUsageSummary {
  used: number
  max: number
}

export type { ChatModelId, ChatModelOption }
export type ChatRuntimeDebugInfo = ChatModelRuntimeInfo
