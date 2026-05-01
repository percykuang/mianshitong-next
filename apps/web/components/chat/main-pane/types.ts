'use client'

import { type RefObject } from 'react'

import {
  type ChatMessageFeedback,
  type ChatModelCatalogState,
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
  modelCatalog: ChatModelCatalogState
  pendingEditedMessageAnchorId: string | null
  modelOptions: readonly ChatModelOption[]
  messages: ConversationMessage[]
  onEditedMessageAnchorApplied: () => void
  onCancelEditUserMessage: () => void
  onModelChange: (value: string) => void
  onDraftChange: (value: string) => void
  onEditingValueChange: (value: string) => void
  onMessageFeedbackChange: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  onRetryModelCatalog: () => void
  onSelectPrompt: (prompt: string) => void
  onStartEditUserMessage: (messageId: string, content: string) => void
  onStop: () => void
  onSubmit: () => void
  onSubmitEditUserMessage: () => void
  onToggleSidebar: () => void
  showThinkingIndicator: boolean
  selectedModelId: string
  sidebarOpen: boolean
  streamingMessageId: string | null
  textareaRef: RefObject<HTMLTextAreaElement | null>
  usage: ChatUsageSummary | null
  usageError: boolean
  usageLoading: boolean
}
