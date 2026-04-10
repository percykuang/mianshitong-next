'use client'

import { useMemo, useState } from 'react'
import { sessionPreviews, type ChatMessageFeedback } from '@/components'
import { sortSessions } from '../utils/chat-session.utils'

export function useChatSessionState() {
  const [sessions, setSessions] = useState(() => sortSessions(sessionPreviews))
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  )
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(
    null
  )
  const [renameDraft, setRenameDraft] = useState('')

  const selectedSession = useMemo(
    () =>
      selectedSessionId
        ? (sessions.find((session) => session.id === selectedSessionId) ?? null)
        : null,
    [selectedSessionId, sessions]
  )

  const deletingSession = deletingSessionId
    ? (sessions.find((session) => session.id === deletingSessionId) ?? null)
    : null
  const renamingSession = renamingSessionId
    ? (sessions.find((session) => session.id === renamingSessionId) ?? null)
    : null

  function resetEditingState() {
    setEditingMessageId(null)
    setEditingValue('')
  }

  function handleNewSession() {
    setSelectedSessionId(null)
    resetEditingState()
  }

  function handleSelectSession(sessionId: string) {
    setSelectedSessionId(sessionId)
    resetEditingState()
  }

  function handleTogglePinSession(sessionId: string) {
    setSessions((currentSessions) => {
      const targetSession = currentSessions.find(
        (session) => session.id === sessionId
      )

      if (!targetSession) {
        return currentSessions
      }

      const nextSession = {
        ...targetSession,
        pinned: !targetSession.pinned,
        pinnedAt: !targetSession.pinned ? Date.now() : undefined,
      }

      return sortSessions(
        currentSessions.map((session) =>
          session.id === sessionId ? nextSession : session
        )
      )
    })
  }

  function handleDeleteSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)

    if (!targetSession) {
      return
    }

    setDeletingSessionId(sessionId)
  }

  function handleCloseDeleteDialog() {
    setDeletingSessionId(null)
  }

  function handleConfirmDeleteSession() {
    if (!deletingSession) {
      return
    }

    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== deletingSession.id)
    )

    setSelectedSessionId((currentSelectedSessionId) =>
      currentSelectedSessionId === deletingSession.id
        ? null
        : currentSelectedSessionId
    )

    resetEditingState()
    handleCloseDeleteDialog()
  }

  function handleRenameSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)

    if (!targetSession) {
      return
    }

    setRenamingSessionId(sessionId)
    setRenameDraft(targetSession.title)
  }

  function handleCloseRenameDialog() {
    setRenamingSessionId(null)
    setRenameDraft('')
  }

  function handleConfirmRenameSession() {
    const nextTitle = renameDraft.trim()

    if (!renamingSession || !nextTitle) {
      return
    }

    if (nextTitle === renamingSession.title) {
      handleCloseRenameDialog()
      return
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === renamingSession.id
          ? { ...session, title: nextTitle }
          : session
      )
    )

    handleCloseRenameDialog()
  }

  function handleStartEditUserMessage(messageId: string, content: string) {
    setEditingMessageId(messageId)
    setEditingValue(content)
  }

  function handleCancelEditUserMessage() {
    resetEditingState()
  }

  function handleSubmitEditUserMessage() {
    const nextContent = editingValue.trim()

    if (!selectedSessionId || !editingMessageId || !nextContent) {
      return
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== selectedSessionId) {
          return session
        }

        const targetMessage = session.messages.find(
          (message) => message.id === editingMessageId
        )

        if (!targetMessage) {
          return session
        }

        return {
          ...session,
          preview:
            session.preview === targetMessage.content
              ? nextContent
              : session.preview,
          messages: session.messages.map((message) =>
            message.id === editingMessageId
              ? { ...message, content: nextContent }
              : message
          ),
        }
      })
    )

    resetEditingState()
  }

  function handleSetMessageFeedback(
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) {
    if (!selectedSessionId) {
      return
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === selectedSessionId
          ? {
              ...session,
              messages: session.messages.map((message) =>
                message.id === messageId
                  ? { ...message, feedback: feedback ?? undefined }
                  : message
              ),
            }
          : session
      )
    )
  }

  return {
    deletingSession,
    editingMessageId,
    editingValue,
    handleCancelEditUserMessage,
    handleCloseDeleteDialog,
    handleCloseRenameDialog,
    handleConfirmDeleteSession,
    handleConfirmRenameSession,
    handleDeleteSession,
    handleNewSession,
    handleRenameSession,
    handleSelectSession,
    handleSetMessageFeedback,
    handleStartEditUserMessage,
    handleSubmitEditUserMessage,
    handleTogglePinSession,
    hasConversationMessages: Boolean(selectedSession?.messages.length),
    renameDraft,
    renamingSession,
    selectedSession,
    selectedSessionId,
    sessions,
    setEditingValue,
    setRenameDraft,
    setSelectedSessionId,
    setSessions,
  }
}
