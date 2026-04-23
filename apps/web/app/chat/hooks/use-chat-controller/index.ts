'use client'

import { useRef } from 'react'

import { usePathname } from 'next/navigation'

import {
  getIsReplying,
  getProjectedSelectedSession,
  getRuntimeDebugInfo,
  getShowThinkingIndicator,
  getStreamingMessageId,
  useChatStore,
} from '../../store'
import { useChatNavigation } from '../use-chat-navigation'
import {
  useChatPathSyncEffect,
  useChatSessionSelectionRouteSyncEffect,
} from './effects'
import { useChatControllerSidebarActions } from './sidebar-actions'
import { type UseChatControllerResult } from './types'

export type {
  ChatControllerComposerGroup,
  ChatControllerMessagesGroup,
  ChatControllerSidebarGroup,
  UseChatControllerResult,
} from './types'

export function useChatController(): UseChatControllerResult {
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const pathname = usePathname()
  const navigation = useChatNavigation(pathname)
  const routeSessionId = navigation.routeSessionId
  const draft = useChatStore((state) => state.draft)
  const editingMessageId = useChatStore((state) => state.editingMessageId)
  const editingValue = useChatStore((state) => state.editingValue)
  const pendingEditedMessageAnchorId = useChatStore(
    (state) => state.pendingEditedMessageAnchorId
  )
  const pendingSidebarSessionId = useChatStore(
    (state) => state.pendingSidebarSessionId
  )
  const selectedModelId = useChatStore((state) => state.selectedModelId)
  const selectedSessionId = useChatStore((state) => state.selectedSessionId)
  const sessions = useChatStore((state) => state.sessions)
  const selectedSession = useChatStore(getProjectedSelectedSession)
  const isReplying = useChatStore(getIsReplying)
  const runtimeDebugInfo = useChatStore(getRuntimeDebugInfo)
  const showThinkingIndicator = useChatStore(getShowThinkingIndicator)
  const streamingMessageId = useChatStore(getStreamingMessageId)
  const sidebarSessions = pendingSidebarSessionId
    ? sessions.filter((session) => session.id !== pendingSidebarSessionId)
    : sessions
  const setDraft = useChatStore((state) => state.setDraft)
  const setSelectedModelId = useChatStore((state) => state.setSelectedModelId)
  const handleSelectPrompt = useChatStore((state) => state.selectPrompt)
  const handleSendMessage = useChatStore((state) => state.sendMessage)
  const handleStopReply = useChatStore((state) => state.stopReply)
  const handleStartEditUserMessage = useChatStore(
    (state) => state.startEditUserMessage
  )
  const handleSubmitEditUserMessage = useChatStore(
    (state) => state.submitEditedMessage
  )
  const handleCancelEditUserMessage = useChatStore(
    (state) => state.cancelEditUserMessage
  )
  const handleSetMessageFeedback = useChatStore(
    (state) => state.setMessageFeedback
  )
  const setEditingValue = useChatStore((state) => state.setEditingValue)
  const consumePendingEditedMessageAnchor = useChatStore(
    (state) => state.consumePendingEditedMessageAnchor
  )
  const sessionState = {
    consumePendingEditedMessageAnchor,
    handleCancelEditUserMessage,
    handleDeleteAllSessions: useChatStore((state) => state.deleteAllSessions),
    handleDeleteSession: useChatStore((state) => state.deleteSession),
    handleInterruptAndNewSession: useChatStore(
      (state) => state.interruptAndNewSession
    ),
    handleInterruptAndSelectSession: useChatStore(
      (state) => state.interruptAndSelectSession
    ),
    handleNewSession: useChatStore((state) => state.newSession),
    handleRenameSession: useChatStore((state) => state.renameSession),
    handleSelectSession: useChatStore((state) => state.selectSession),
    handleSetMessageFeedback,
    handleStartEditUserMessage,
    handleTogglePinSession: useChatStore((state) => state.togglePinSession),
    hasConversationMessages: Boolean(selectedSession?.messages.length),
    pendingEditedMessageAnchorId,
    selectedSession,
    selectedSessionId,
    sessions: sidebarSessions,
    setEditingValue,
  }
  const replyState = {
    setDraft,
  }
  const sidebar = useChatControllerSidebarActions({
    navigation,
    replyState,
    sessionState,
  })

  useChatSessionSelectionRouteSyncEffect({
    isReplying,
    pathname,
    routeSessionId,
    selectedSessionId,
    sessions,
    onSelectRouteNewSession: sessionState.handleNewSession,
    onSelectRouteSession: sessionState.handleSelectSession,
  })
  useChatPathSyncEffect({
    applyHistory: navigation.applyHistory,
    selectedSessionId,
    takeRequestedHistoryMode: navigation.takeRequestedHistoryMode,
  })

  return {
    composer: {
      composerRef,
      draft,
      handleSelectPrompt,
      handleSendMessage,
      handleStopReply,
      isReplying,
      runtimeDebugInfo,
      selectedModelId,
      setDraft,
      setSelectedModelId,
      showThinkingIndicator,
      streamingMessageId,
    },
    messages: {
      consumePendingEditedMessageAnchor,
      editingMessageId,
      editingValue,
      handleCancelEditUserMessage,
      handleSetMessageFeedback,
      handleStartEditUserMessage,
      handleSubmitEditUserMessage,
      hasConversationMessages: Boolean(selectedSession?.messages.length),
      pendingEditedMessageAnchorId,
      selectedSession,
      setEditingValue,
    },
    sidebar,
  }
}
