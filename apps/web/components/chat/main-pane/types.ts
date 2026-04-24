'use client'

import { type RefObject } from 'react'

import {
  type ChatMessageFeedback,
  type ChatModelId,
  type ChatModelOption,
  type ChatUsageSummary,
  type ConversationMessage,
} from '../types'

export interface ChatMainPaneProps {
  activeSessionId: string | null
  draft: string
  followRequestKey: number
  hasConversationMessages: boolean
  isReplying: boolean
  editingMessageId: string | null
  editingValue: string
  pendingEditedMessageAnchorId: string | null
  modelOptions: readonly ChatModelOption[]
  messages: ConversationMessage[]
  onEditedMessageAnchorApplied: () => void
  onCancelEditUserMessage: () => void
  onModelChange: (value: ChatModelId) => void
  onDraftChange: (value: string) => void
  onEditingValueChange: (value: string) => void
  onMessageFeedbackChange: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  onSelectPrompt: (prompt: string) => void
  onStartEditUserMessage: (messageId: string, content: string) => void
  onStop: () => void
  onSubmit: () => void
  onSubmitEditUserMessage: () => void
  onToggleSidebar: () => void
  showThinkingIndicator: boolean
  selectedModelId: ChatModelId
  sidebarOpen: boolean
  streamingMessageId: string | null
  textareaRef: RefObject<HTMLTextAreaElement | null>
  usage: ChatUsageSummary | null
  usageError: boolean
  usageLoading: boolean
}
