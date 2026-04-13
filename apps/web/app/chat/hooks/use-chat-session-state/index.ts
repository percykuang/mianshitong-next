'use client'

import { useMemo, useState } from 'react'
import { sortSessions } from '../../utils'
import { createChatSessionActions } from './session-actions'
import { useChatMessageEditing } from './message-editing'
import { useChatMessageFeedback } from './message-feedback'
import { type UseChatSessionStateOptions } from './types'

export function useChatSessionState({
  initialSessions,
  initialSelectedSessionId,
  persistenceEnabled,
}: UseChatSessionStateOptions) {
  const [sessions, setSessions] = useState(() => sortSessions(initialSessions))
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    () =>
      persistenceEnabled &&
      initialSelectedSessionId &&
      initialSessions.some((session) => session.id === initialSelectedSessionId)
        ? initialSelectedSessionId
        : null
  )

  const selectedSession = useMemo(
    () =>
      selectedSessionId
        ? (sessions.find((session) => session.id === selectedSessionId) ?? null)
        : null,
    [selectedSessionId, sessions]
  )

  const editingState = useChatMessageEditing({
    selectedSessionId,
    setSessions,
  })
  const sessionActions = createChatSessionActions({
    persistenceEnabled,
    resetEditingState: editingState.resetEditingState,
    sessions,
    setSelectedSessionId,
    setSessions,
  })
  const feedbackState = useChatMessageFeedback({
    persistenceEnabled,
    selectedSession,
    selectedSessionId,
    setSessions,
  })

  return {
    editingMessageId: editingState.editingMessageId,
    editingValue: editingState.editingValue,
    handleCancelEditUserMessage: editingState.handleCancelEditUserMessage,
    handleDeleteSession: sessionActions.handleDeleteSession,
    handleDeleteAllSessions: sessionActions.handleDeleteAllSessions,
    handleNewSession: sessionActions.handleNewSession,
    handleRenameSession: sessionActions.handleRenameSession,
    handleSelectSession: sessionActions.handleSelectSession,
    handleSetMessageFeedback: feedbackState.handleSetMessageFeedback,
    handleStartEditUserMessage: editingState.handleStartEditUserMessage,
    handleSubmitEditUserMessage: editingState.handleSubmitEditUserMessage,
    handleTogglePinSession: sessionActions.handleTogglePinSession,
    hasConversationMessages: Boolean(selectedSession?.messages.length),
    selectedSession,
    selectedSessionId,
    sessions,
    setEditingValue: editingState.setEditingValue,
    setSelectedSessionId,
    setSessions,
  }
}
