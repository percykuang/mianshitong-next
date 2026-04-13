'use client'

import { type Dispatch, type RefObject, type SetStateAction } from 'react'
import {
  type ChatMessageFeedback,
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'

export interface UseChatControllerOptions {
  initialSessions: ChatSessionPreview[]
  initialSelectedSessionId: string | null
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  initialSelectedModelId: ChatModelId
  persistenceEnabled: boolean
}

export interface ChatControllerComposerGroup {
  composerRef: RefObject<HTMLTextAreaElement | null>
  draft: string
  handleSelectPrompt: (prompt: string) => Promise<void>
  handleSendMessage: (inputOverride?: string) => Promise<void>
  handleStopReply: () => void
  isReplying: boolean
  runtimeDebugInfo: ChatRuntimeDebugInfo | null
  selectedModelId: ChatModelId
  setDraft: Dispatch<SetStateAction<string>>
  setSelectedModelId: Dispatch<SetStateAction<ChatModelId>>
  showThinkingIndicator: boolean
  streamingMessageId: string | null
}

export interface ChatControllerMessagesGroup {
  editingMessageId: string | null
  editingValue: string
  handleCancelEditUserMessage: () => void
  handleSetMessageFeedback: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  handleStartEditUserMessage: (messageId: string, content: string) => void
  handleSubmitEditUserMessage: () => void
  hasConversationMessages: boolean
  selectedSession: ChatSessionPreview | null
  setEditingValue: Dispatch<SetStateAction<string>>
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
  editingMessageId: string | null
  editingValue: string
  handleCancelEditUserMessage: () => void
  handleDeleteAllSessions: () => Promise<number | null>
  handleDeleteSession: (sessionId: string) => Promise<boolean>
  handleNewSession: () => void
  handleRenameSession: (sessionId: string, title: string) => Promise<boolean>
  handleSelectSession: (sessionId: string) => void
  handleSetMessageFeedback: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  handleStartEditUserMessage: (messageId: string, content: string) => void
  handleSubmitEditUserMessage: () => void
  handleTogglePinSession: (sessionId: string) => Promise<void>
  hasConversationMessages: boolean
  selectedSession: ChatSessionPreview | null
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  setEditingValue: Dispatch<SetStateAction<string>>
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export interface ChatReplyStateLike {
  composerRef: RefObject<HTMLTextAreaElement | null>
  draft: string
  handleSelectPrompt: (prompt: string) => Promise<void>
  handleSendMessage: (inputOverride?: string) => Promise<void>
  handleStopReply: () => void
  isReplying: boolean
  runtimeDebugInfo: ChatRuntimeDebugInfo | null
  selectedModelId: ChatModelId
  setDraft: Dispatch<SetStateAction<string>>
  setSelectedModelId: Dispatch<SetStateAction<ChatModelId>>
  showThinkingIndicator: boolean
  streamingMessageId: string | null
}
