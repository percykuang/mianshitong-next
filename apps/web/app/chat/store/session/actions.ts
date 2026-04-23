'use client'

import { createLogger } from '@mianshitong/shared'

import {
  deleteAllPersistedChatSessions,
  deletePersistedChatSession,
  replaceSession,
  updateMessageFeedbackInSessions,
  updatePersistedChatMessageFeedback,
  updatePersistedChatSession,
  upsertSession,
} from '../../utils'
import { getLastEditableUserMessageId, getSessionById } from '../core/helpers'
import { isReplying } from '../core/selectors'
import {
  type ChatStoreActions,
  type ChatStoreGetState,
  type ChatStoreSetState,
} from '../core/types'

const RESET_EDITING_STATE = {
  editingMessageId: null,
  editingValue: '',
} as const

const RESET_EDITING_WITH_PENDING_ANCHOR_STATE = {
  ...RESET_EDITING_STATE,
  pendingEditedMessageAnchorId: null,
} as const
const logger = createLogger('chat-store')

interface CreateChatSessionActionsInput {
  feedbackMutationVersionByKey: Map<string, number>
  get: ChatStoreGetState
  set: ChatStoreSetState
}

export function createChatSessionActions({
  feedbackMutationVersionByKey,
  get,
  set,
}: CreateChatSessionActionsInput): Pick<
  ChatStoreActions,
  | 'cancelEditUserMessage'
  | 'consumePendingEditedMessageAnchor'
  | 'deleteAllSessions'
  | 'deleteSession'
  | 'newSession'
  | 'renameSession'
  | 'selectSession'
  | 'setDraft'
  | 'setEditingValue'
  | 'setMessageFeedback'
  | 'setSelectedModelId'
  | 'startEditUserMessage'
  | 'togglePinSession'
> {
  return {
    cancelEditUserMessage() {
      set(RESET_EDITING_WITH_PENDING_ANCHOR_STATE)
    },

    consumePendingEditedMessageAnchor() {
      set({ pendingEditedMessageAnchorId: null })
    },

    async deleteAllSessions() {
      const state = get()
      let deletedCount = state.sessions.length

      if (state.persistenceEnabled) {
        try {
          deletedCount = await deleteAllPersistedChatSessions()
        } catch (error) {
          logger.error('delete all sessions failed', error)
          return null
        }
      }

      set({
        draft: '',
        ...RESET_EDITING_STATE,
        pendingSidebarSessionId: null,
        pendingEditedMessageAnchorId: null,
        selectedSessionId: null,
        sessions: [],
      })

      return deletedCount
    },

    async deleteSession(sessionId) {
      const state = get()
      const targetSession = state.sessions.find(
        (session) => session.id === sessionId
      )

      if (!targetSession) {
        return false
      }

      if (state.persistenceEnabled) {
        try {
          await deletePersistedChatSession(targetSession.id)
        } catch (error) {
          logger.error('delete session failed', error)
          return false
        }
      }

      set((currentState) => ({
        ...RESET_EDITING_STATE,
        pendingSidebarSessionId:
          currentState.pendingSidebarSessionId === targetSession.id
            ? null
            : currentState.pendingSidebarSessionId,
        pendingEditedMessageAnchorId: null,
        selectedSessionId:
          currentState.selectedSessionId === targetSession.id
            ? null
            : currentState.selectedSessionId,
        sessions: currentState.sessions.filter(
          (session) => session.id !== targetSession.id
        ),
      }))

      return true
    },

    newSession() {
      set({
        draft: '',
        ...RESET_EDITING_STATE,
        pendingSidebarSessionId: null,
        selectedSessionId: null,
      })
    },

    async renameSession(sessionId, title) {
      const state = get()
      const targetSession = state.sessions.find(
        (session) => session.id === sessionId
      )
      const nextTitle = title.trim()

      if (!targetSession || !nextTitle) {
        return false
      }

      if (nextTitle === targetSession.title) {
        return true
      }

      if (!state.persistenceEnabled) {
        set((currentState) => ({
          sessions: replaceSession(currentState.sessions, targetSession.id, {
            ...targetSession,
            title: nextTitle,
          }),
        }))

        return true
      }

      try {
        const updatedSession = await updatePersistedChatSession(
          targetSession.id,
          {
            title: nextTitle,
          }
        )

        set((currentState) => ({
          sessions: replaceSession(
            currentState.sessions,
            targetSession.id,
            updatedSession
          ),
        }))

        return true
      } catch (error) {
        logger.error('rename session failed', error)
        return false
      }
    },

    selectSession(sessionId) {
      set({
        ...RESET_EDITING_STATE,
        selectedSessionId: sessionId,
      })
    },

    setDraft(value) {
      set({ draft: value })
    },

    setEditingValue(value) {
      set({ editingValue: value })
    },

    setMessageFeedback(messageId, feedback) {
      const state = get()

      if (!state.selectedSessionId) {
        return
      }

      const targetSessionId = state.selectedSessionId
      const selectedSession = getSessionById(state.sessions, targetSessionId)
      const previousFeedback =
        selectedSession?.messages.find((message) => message.id === messageId)
          ?.feedback ?? null

      if (!selectedSession) {
        return
      }

      set((currentState) => ({
        sessions: updateMessageFeedbackInSessions(currentState.sessions, {
          feedback,
          messageId,
          sessionId: targetSessionId,
        }),
      }))

      if (!state.persistenceEnabled) {
        return
      }

      const mutationKey = `${targetSessionId}:${messageId}`
      const nextMutationVersion =
        (feedbackMutationVersionByKey.get(mutationKey) ?? 0) + 1
      feedbackMutationVersionByKey.set(mutationKey, nextMutationVersion)

      void updatePersistedChatMessageFeedback(
        targetSessionId,
        messageId,
        feedback
      )
        .then((updatedSession) => {
          if (
            feedbackMutationVersionByKey.get(mutationKey) !==
            nextMutationVersion
          ) {
            return
          }

          set((currentState) => ({
            sessions: replaceSession(
              currentState.sessions,
              targetSessionId,
              updatedSession
            ),
          }))
        })
        .catch((error) => {
          if (
            feedbackMutationVersionByKey.get(mutationKey) !==
            nextMutationVersion
          ) {
            return
          }

          logger.error('update message feedback failed', error)

          set((currentState) => ({
            sessions: updateMessageFeedbackInSessions(currentState.sessions, {
              feedback: previousFeedback,
              messageId,
              sessionId: targetSessionId,
            }),
          }))
        })
    },

    setSelectedModelId(value) {
      set({ selectedModelId: value })
    },

    startEditUserMessage(messageId, content) {
      const state = get()
      const selectedSession = getSessionById(
        state.sessions,
        state.selectedSessionId
      )

      if (isReplying(state.activeReply)) {
        return
      }

      if (messageId !== getLastEditableUserMessageId(selectedSession)) {
        return
      }

      set({
        editingMessageId: messageId,
        editingValue: content,
        pendingEditedMessageAnchorId: null,
      })
    },

    async togglePinSession(sessionId) {
      const state = get()
      const targetSession = state.sessions.find(
        (session) => session.id === sessionId
      )

      if (!targetSession) {
        return
      }

      if (!state.persistenceEnabled) {
        set((currentState) => {
          const nextSession = {
            ...targetSession,
            pinned: !targetSession.pinned,
            pinnedAt: !targetSession.pinned ? Date.now() : undefined,
          }

          return {
            sessions: upsertSession(
              currentState.sessions,
              sessionId,
              nextSession
            ),
          }
        })

        return
      }

      try {
        const updatedSession = await updatePersistedChatSession(sessionId, {
          pinned: !targetSession.pinned,
        })

        set((currentState) => ({
          sessions: replaceSession(
            currentState.sessions,
            sessionId,
            updatedSession
          ),
        }))
      } catch (error) {
        logger.error('toggle pin failed', error)
      }
    },
  }
}
