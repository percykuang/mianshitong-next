import type {
  ChatModelId,
  ChatModelOption,
  ChatModelRuntimeInfo,
} from '@mianshitong/providers/model/types'

export type ChatMessageCompletionStatus = 'completed' | 'interrupted'

export interface ConversationMessage {
  id: string
  role: 'assistant' | 'user'
  label: string
  timestamp: string
  content: string
  completionStatus?: ChatMessageCompletionStatus
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
  updatedAt: number
  messages: ConversationMessage[]
}

export interface ChatUsageSummary {
  used: number
  max: number
}

export type { ChatModelId, ChatModelOption }
export type ChatRuntimeDebugInfo = ChatModelRuntimeInfo
