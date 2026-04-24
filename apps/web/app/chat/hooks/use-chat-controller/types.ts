import { type Dispatch, type RefObject, type SetStateAction } from 'react'

import {
  type ChatMessageFeedback,
  type ChatModelId,
  type ChatSessionPreview,
} from '@/app/chat/domain'

export interface ChatControllerComposerGroup {
  composerRef: RefObject<HTMLTextAreaElement | null>
  draft: string
  handleSelectPrompt: (prompt: string) => Promise<void>
  handleSendMessage: (inputOverride?: string) => Promise<void>
  handleStopReply: () => void
  isReplying: boolean
  selectedModelId: ChatModelId
  setDraft: (value: string) => void
  setSelectedModelId: (value: ChatModelId) => void
  showThinkingIndicator: boolean
  streamingMessageId: string | null
}

export interface ChatControllerMessagesGroup {
  consumePendingEditedMessageAnchor: () => void
  editingMessageId: string | null
  editingValue: string
  handleCancelEditUserMessage: () => void
  handleSetMessageFeedback: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  handleStartEditUserMessage: (messageId: string, content: string) => void
  handleSubmitEditUserMessage: () => Promise<boolean>
  hasConversationMessages: boolean
  pendingEditedMessageAnchorId: string | null
  selectedSession: ChatSessionPreview | null
  setEditingValue: (value: string) => void
}

export interface ChatControllerSidebarGroup {
  handleDeleteAllSessions: () => void
  handleDeleteSession: (sessionId: string) => void
  handleNewSession: () => void
  handleRenameSession: (sessionId: string) => void
  handleSelectSession: (sessionId: string) => void
  handleTogglePinSession: (sessionId: string) => void
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
  sidebarOpen: boolean
}

export interface UseChatControllerResult {
  composer: ChatControllerComposerGroup
  messages: ChatControllerMessagesGroup
  sidebar: ChatControllerSidebarGroup
}

export interface ChatSessionStateLike {
  consumePendingEditedMessageAnchor: () => void
  handleCancelEditUserMessage: () => void
  handleDeleteAllSessions: () => Promise<number | null>
  handleDeleteSession: (sessionId: string) => Promise<boolean>
  handleInterruptAndNewSession: () => Promise<void>
  handleInterruptAndSelectSession: (sessionId: string) => Promise<void>
  handleNewSession: () => void
  handleRenameSession: (sessionId: string, title: string) => Promise<boolean>
  handleSelectSession: (sessionId: string) => void
  handleSetMessageFeedback: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  handleStartEditUserMessage: (messageId: string, content: string) => void
  handleTogglePinSession: (sessionId: string) => Promise<void>
  hasConversationMessages: boolean
  pendingEditedMessageAnchorId: string | null
  selectedSession: ChatSessionPreview | null
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  setEditingValue: (value: string) => void
}

export interface ChatReplyStateLike {
  setDraft: (value: string) => void
}
