'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { type ChatMessageFeedback, type ChatSessionPreview } from '@/components'

export interface UseChatSessionStateOptions {
  initialSessions: ChatSessionPreview[]
  initialSelectedSessionId: string | null
  persistenceEnabled: boolean
}

export interface ChatSessionEditingState {
  editingMessageId: string | null
  editingValue: string
  pendingEditedMessageAnchorId: string | null
  consumePendingEditedMessageAnchor: () => void
  handleCancelEditUserMessage: () => void
  handleStartEditUserMessage: (messageId: string, content: string) => void
  queuePendingEditedMessageAnchor: (messageId: string) => void
  resetEditingState: () => void
  setEditingValue: Dispatch<SetStateAction<string>>
}

export interface ChatSessionActionsOptions {
  persistenceEnabled: boolean
  resetEditingState: () => void
  sessions: ChatSessionPreview[]
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export interface ChatMessageFeedbackOptions {
  persistenceEnabled: boolean
  selectedSession: ChatSessionPreview | null
  selectedSessionId: string | null
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export interface ChatMessageFeedbackState {
  handleSetMessageFeedback: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
}
