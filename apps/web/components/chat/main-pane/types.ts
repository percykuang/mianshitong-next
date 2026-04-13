'use client'

import { type RefObject } from 'react'
import {
  type ChatMessageFeedback,
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
  type ConversationMessage,
} from '../types'

export interface ChatMainPaneProps {
  activeSessionId: string | null
  draft: string
  hasConversationMessages: boolean
  isReplying: boolean
  editingMessageId: string | null
  editingValue: string
  modelOptions: readonly ChatModelOption[]
  messages: ConversationMessage[]
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
  runtimeDebugInfo: ChatRuntimeDebugInfo | null
  showThinkingIndicator: boolean
  selectedModelId: ChatModelId
  sidebarOpen: boolean
  streamingMessageId: string | null
  textareaRef: RefObject<HTMLTextAreaElement | null>
}
