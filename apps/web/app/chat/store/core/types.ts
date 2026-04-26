'use client'

import type { StoreApi } from 'zustand'

import {
  type ChatMessageFeedback,
  type ChatModelId,
  type ChatSessionPreview,
} from '@/app/chat/domain'

export type ActiveReplyStatus =
  | 'awaiting-first-chunk'
  | 'streaming'
  | 'stopping'

export interface ActiveReply {
  assistantMessageId: string
  latestContent: string
  mode: 'edit' | 'new'
  optimisticSessionId: string | null
  sessionId: string
  status: ActiveReplyStatus
}

export interface ChatStoreInitialState {
  initialSelectedModelId: ChatModelId
  initialSelectedSessionId: string | null
  initialSessions: ChatSessionPreview[]
  persistenceEnabled: boolean
}

export interface ChatStoreState {
  activeReply: ActiveReply | null
  draft: string
  editingMessageId: string | null
  editingValue: string
  generatingTitleSessionIds: string[]
  pendingSidebarSessionId: string | null
  pendingEditedMessageAnchorId: string | null
  persistenceEnabled: boolean
  selectedModelId: ChatModelId
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
}

export interface ChatStoreActions {
  consumePendingEditedMessageAnchor: () => void
  deleteAllSessions: () => Promise<number | null>
  deleteSession: (sessionId: string) => Promise<boolean>
  dispose: () => void
  generateSessionTitle: (sessionId: string) => Promise<void>
  interruptAndNewSession: () => Promise<void>
  interruptAndSelectSession: (sessionId: string) => Promise<void>
  newSession: () => void
  renameSession: (sessionId: string, title: string) => Promise<boolean>
  selectPrompt: (prompt: string) => Promise<void>
  selectSession: (sessionId: string) => void
  sendMessage: (inputOverride?: string) => Promise<void>
  setDraft: (value: string) => void
  setMessageFeedback: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  setSelectedModelId: (value: ChatModelId) => void
  setEditingValue: (value: string) => void
  startEditUserMessage: (messageId: string, content: string) => void
  stopReply: () => void
  submitEditedMessage: () => Promise<boolean>
  togglePinSession: (sessionId: string) => Promise<void>
  cancelEditUserMessage: () => void
}

export type ChatStore = ChatStoreState & ChatStoreActions

export type ChatStoreApi = StoreApi<ChatStore>
export type ChatStoreGetState = ChatStoreApi['getState']
export type ChatStoreSetState = ChatStoreApi['setState']
export type ChatStoreSubscribe = ChatStoreApi['subscribe']
