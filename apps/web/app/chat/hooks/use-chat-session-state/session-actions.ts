'use client'

import {
  deleteAllPersistedChatSessions,
  deletePersistedChatSession,
  sortSessions,
  updatePersistedChatSession,
} from '../../utils'
import { type ChatSessionActionsOptions } from './types'

export function createChatSessionActions({
  persistenceEnabled,
  resetEditingState,
  sessions,
  setSelectedSessionId,
  setSessions,
}: ChatSessionActionsOptions) {
  function handleNewSession() {
    setSelectedSessionId(null)
    resetEditingState()
  }

  function handleSelectSession(sessionId: string) {
    setSelectedSessionId(sessionId)
    resetEditingState()
  }

  async function handleTogglePinSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)

    if (!targetSession) {
      return
    }

    if (!persistenceEnabled) {
      setSessions((currentSessions) => {
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
      return
    }

    try {
      const updatedSession = await updatePersistedChatSession(sessionId, {
        pinned: !targetSession.pinned,
      })

      setSessions((currentSessions) =>
        sortSessions(
          currentSessions.map((session) =>
            session.id === sessionId ? updatedSession : session
          )
        )
      )
    } catch (error) {
      console.error('[chat-session-state] toggle pin failed', error)
    }
  }

  async function handleDeleteSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)

    if (!targetSession) {
      return false
    }

    if (persistenceEnabled) {
      try {
        await deletePersistedChatSession(targetSession.id)
      } catch (error) {
        console.error('[chat-session-state] delete session failed', error)
        return false
      }
    }

    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== targetSession.id)
    )

    setSelectedSessionId((currentSelectedSessionId) =>
      currentSelectedSessionId === targetSession.id
        ? null
        : currentSelectedSessionId
    )

    resetEditingState()

    return true
  }

  async function handleDeleteAllSessions() {
    let deletedCount = sessions.length

    if (persistenceEnabled) {
      try {
        deletedCount = await deleteAllPersistedChatSessions()
      } catch (error) {
        console.error('[chat-session-state] delete all sessions failed', error)
        return null
      }
    }

    setSessions([])
    setSelectedSessionId(null)
    resetEditingState()

    return deletedCount
  }

  async function handleRenameSession(sessionId: string, title: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)
    const nextTitle = title.trim()

    if (!targetSession || !nextTitle) {
      return false
    }

    if (nextTitle === targetSession.title) {
      return true
    }

    if (!persistenceEnabled) {
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === targetSession.id
            ? { ...session, title: nextTitle }
            : session
        )
      )

      return true
    }

    try {
      const updatedSession = await updatePersistedChatSession(
        targetSession.id,
        {
          title: nextTitle,
        }
      )

      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === targetSession.id ? updatedSession : session
        )
      )

      return true
    } catch (error) {
      console.error('[chat-session-state] rename session failed', error)
      return false
    }
  }

  return {
    handleDeleteAllSessions,
    handleDeleteSession,
    handleNewSession,
    handleRenameSession,
    handleSelectSession,
    handleTogglePinSession,
  }
}
