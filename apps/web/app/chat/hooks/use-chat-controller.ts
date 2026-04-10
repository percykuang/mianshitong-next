'use client'

import { useRouter } from 'next/navigation'
import {
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import {
  type ChatMessageFeedback,
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import { useChatReplyState } from './use-chat-reply-state'
import { useChatSessionState } from './use-chat-session-state'

interface UseChatControllerOptions {
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  initialSelectedModelId: ChatModelId
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

export interface ChatControllerDialogsGroup {
  deletingSession: ChatSessionPreview | null
  handleCloseDeleteDialog: () => void
  handleCloseRenameDialog: () => void
  handleConfirmDeleteSession: () => void
  handleConfirmRenameSession: () => void
  renameDraft: string
  renamingSession: ChatSessionPreview | null
  setRenameDraft: Dispatch<SetStateAction<string>>
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
  handleDeleteSession: (sessionId: string) => void
  handleLogout: () => void
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
  dialogs: ChatControllerDialogsGroup
  messages: ChatControllerMessagesGroup
  sidebar: ChatControllerSidebarGroup
}

export function useChatController({
  initialRuntimeDebugInfoByModelId,
  initialSelectedModelId,
}: UseChatControllerOptions): UseChatControllerResult {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sessionState = useChatSessionState()
  const replyState = useChatReplyState({
    initialRuntimeDebugInfoByModelId,
    initialSelectedModelId,
    selectedSessionId: sessionState.selectedSessionId,
    sessions: sessionState.sessions,
    setSelectedSessionId: sessionState.setSelectedSessionId,
    setSessions: sessionState.setSessions,
  })

  function handleLogout() {
    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      router.refresh()
    })
  }

  function handleNewSession() {
    sessionState.handleNewSession()
    replyState.setDraft('')
  }

  function handleStartEditUserMessage(messageId: string, content: string) {
    if (replyState.isReplying) {
      return
    }

    sessionState.handleStartEditUserMessage(messageId, content)
  }

  return {
    composer: {
      composerRef: replyState.composerRef,
      draft: replyState.draft,
      handleSelectPrompt: replyState.handleSelectPrompt,
      handleSendMessage: replyState.handleSendMessage,
      handleStopReply: replyState.handleStopReply,
      isReplying: replyState.isReplying,
      runtimeDebugInfo: replyState.runtimeDebugInfo,
      selectedModelId: replyState.selectedModelId,
      setDraft: replyState.setDraft,
      setSelectedModelId: replyState.setSelectedModelId,
      showThinkingIndicator: replyState.showThinkingIndicator,
      streamingMessageId: replyState.streamingMessageId,
    },
    dialogs: {
      deletingSession: sessionState.deletingSession,
      handleCloseDeleteDialog: sessionState.handleCloseDeleteDialog,
      handleCloseRenameDialog: sessionState.handleCloseRenameDialog,
      handleConfirmDeleteSession: sessionState.handleConfirmDeleteSession,
      handleConfirmRenameSession: sessionState.handleConfirmRenameSession,
      renameDraft: sessionState.renameDraft,
      renamingSession: sessionState.renamingSession,
      setRenameDraft: sessionState.setRenameDraft,
    },
    messages: {
      editingMessageId: sessionState.editingMessageId,
      editingValue: sessionState.editingValue,
      handleCancelEditUserMessage: sessionState.handleCancelEditUserMessage,
      handleSetMessageFeedback: sessionState.handleSetMessageFeedback,
      handleStartEditUserMessage,
      handleSubmitEditUserMessage: sessionState.handleSubmitEditUserMessage,
      hasConversationMessages: sessionState.hasConversationMessages,
      selectedSession: sessionState.selectedSession,
      setEditingValue: sessionState.setEditingValue,
    },
    sidebar: {
      handleDeleteSession: sessionState.handleDeleteSession,
      handleLogout,
      handleNewSession,
      handleRenameSession: sessionState.handleRenameSession,
      handleSelectSession: sessionState.handleSelectSession,
      handleTogglePinSession: sessionState.handleTogglePinSession,
      selectedSessionId: sessionState.selectedSessionId,
      sessions: sessionState.sessions,
      setSidebarOpen,
      sidebarOpen,
    },
  }
}
