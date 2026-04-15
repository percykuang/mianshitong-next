'use client'

import {
  buildOptimisticEditedSession,
  createNextSession,
  getPersistedChatSession,
  streamChatReply,
  streamEditedChatReply,
} from '../../utils'
import {
  getSessionById,
  hydratePersistedSession,
  replaceSession,
  upsertSession,
} from '../core/helpers'
import { isReplying } from '../core/selectors'
import { type ChatReplyLifecycle } from './lifecycle'
import { type ChatStoreGetState, type ChatStoreSetState } from '../core/types'

interface CreateChatReplyStreamActionsInput {
  get: ChatStoreGetState
  lifecycle: ChatReplyLifecycle
  set: ChatStoreSetState
  setActiveAbortController: (controller: AbortController | null) => void
}

export function createChatReplyStreamActions({
  get,
  lifecycle,
  set,
  setActiveAbortController,
}: CreateChatReplyStreamActionsInput) {
  async function sendMessage(inputOverride?: string) {
    const initialState = get()
    const input = (inputOverride ?? initialState.draft).trim()

    if (!input || isReplying(initialState.activeReply)) {
      return
    }

    const optimisticSession = createNextSession({
      input,
      selectedSessionId: initialState.selectedSessionId,
      sessions: initialState.sessions,
    })
    const activeSessionId = optimisticSession.id
    const assistantMessageId = `assistant-${Date.now()}`
    const isNewSession = initialState.selectedSessionId === null
    const shouldHideSessionFromSidebar =
      initialState.persistenceEnabled && isNewSession

    set((state) => ({
      activeReply: {
        assistantMessageId,
        latestContent: '',
        mode: 'new',
        optimisticSessionId: isNewSession ? activeSessionId : null,
        sessionId: activeSessionId,
        status: 'awaiting-first-chunk',
      },
      draft: '',
      pendingSidebarSessionId: shouldHideSessionFromSidebar
        ? activeSessionId
        : state.pendingSidebarSessionId,
      selectedSessionId: activeSessionId,
      sessions: upsertSession(
        state.sessions,
        activeSessionId,
        optimisticSession
      ),
    }))

    const controller = new AbortController()
    setActiveAbortController(controller)

    try {
      const {
        content,
        runtimeDebugInfo,
        sessionId: persistedSessionId,
      } = await streamChatReply({
        history: optimisticSession.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        message: input,
        modelId: initialState.selectedModelId,
        sessionId: initialState.persistenceEnabled
          ? activeSessionId
          : undefined,
        signal: controller.signal,
        onChunk(nextContent) {
          lifecycle.syncReplyChunk(assistantMessageId, nextContent)
        },
      })

      lifecycle.syncReplyResult({
        assistantMessageId,
        content,
        runtimeDebugInfo,
      })

      const completedReply = get().activeReply

      if (
        completedReply &&
        completedReply.assistantMessageId === assistantMessageId
      ) {
        lifecycle.finalizeCompletedReply({
          activeReply: completedReply,
          assistantMessageId,
        })
      }

      if (initialState.persistenceEnabled) {
        await lifecycle.hydrateSession(
          persistedSessionId ?? activeSessionId,
          activeSessionId
        )
      }
    } catch (error) {
      const activeReply = get().activeReply

      if (
        activeReply &&
        activeReply.assistantMessageId === assistantMessageId
      ) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          await lifecycle.finalizeInterruptedReply({
            activeReply,
            assistantMessageId,
          })
        } else if (initialState.persistenceEnabled && isNewSession) {
          const persistedSession = await getPersistedChatSession(
            activeReply.sessionId
          ).catch(() => null)

          if (persistedSession && persistedSession.messages.length > 0) {
            set((state) => ({
              activeReply:
                state.activeReply?.assistantMessageId === assistantMessageId
                  ? null
                  : state.activeReply,
              pendingSidebarSessionId:
                state.pendingSidebarSessionId ===
                  (activeReply.optimisticSessionId ?? persistedSession.id) ||
                state.pendingSidebarSessionId === persistedSession.id
                  ? null
                  : state.pendingSidebarSessionId,
              selectedSessionId: persistedSession.id,
              sessions: hydratePersistedSession(
                state.sessions,
                activeReply.optimisticSessionId ?? persistedSession.id,
                persistedSession
              ),
            }))
          } else {
            set((state) => ({
              activeReply:
                state.activeReply?.assistantMessageId === assistantMessageId
                  ? null
                  : state.activeReply,
              draft: state.draft || input,
              pendingSidebarSessionId:
                state.pendingSidebarSessionId === activeSessionId
                  ? null
                  : state.pendingSidebarSessionId,
              selectedSessionId: initialState.selectedSessionId,
              sessions: state.sessions.filter(
                (session) => session.id !== activeSessionId
              ),
            }))
          }
        } else {
          await lifecycle.finalizeFailedReply({
            activeReply,
            assistantMessageId,
            error,
          })
        }
      }
    } finally {
      setActiveAbortController(null)
      lifecycle.clearActiveReply(assistantMessageId)
    }
  }

  async function submitEditedMessage() {
    const state = get()
    const selectedSession = getSessionById(
      state.sessions,
      state.selectedSessionId
    )
    const nextContent = state.editingValue.trim()
    const editingMessageId = state.editingMessageId

    if (
      isReplying(state.activeReply) ||
      !selectedSession ||
      !editingMessageId ||
      !nextContent
    ) {
      return false
    }

    const assistantMessageId = `assistant-edit-${Date.now()}`
    const optimisticSession = buildOptimisticEditedSession({
      content: nextContent,
      messageId: editingMessageId,
      session: selectedSession,
    })

    if (!optimisticSession) {
      return false
    }

    set((currentState) => ({
      activeReply: {
        assistantMessageId,
        latestContent: '',
        mode: 'edit',
        optimisticSessionId: selectedSession.id,
        sessionId: selectedSession.id,
        status: 'awaiting-first-chunk',
      },
      editingMessageId: null,
      editingValue: '',
      pendingEditedMessageAnchorId: editingMessageId,
      sessions: replaceSession(
        currentState.sessions,
        optimisticSession.id,
        optimisticSession
      ),
    }))

    const controller = new AbortController()
    setActiveAbortController(controller)

    try {
      const {
        content,
        runtimeDebugInfo,
        sessionId: persistedSessionId,
      } = await streamEditedChatReply({
        content: nextContent,
        messageId: editingMessageId,
        onChunk(nextChunkContent) {
          lifecycle.syncReplyChunk(assistantMessageId, nextChunkContent)
        },
        sessionId: selectedSession.id,
        signal: controller.signal,
      })

      lifecycle.syncReplyResult({
        assistantMessageId,
        content,
        runtimeDebugInfo,
      })

      const completedReply = get().activeReply

      if (
        completedReply &&
        completedReply.assistantMessageId === assistantMessageId
      ) {
        lifecycle.finalizeCompletedReply({
          activeReply: completedReply,
          assistantMessageId,
        })
      }

      if (state.persistenceEnabled) {
        await lifecycle.hydrateSession(
          persistedSessionId ?? selectedSession.id,
          selectedSession.id
        )
      }

      return true
    } catch (error) {
      const activeReply = get().activeReply

      if (
        activeReply &&
        activeReply.assistantMessageId === assistantMessageId
      ) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          await lifecycle.finalizeInterruptedReply({
            activeReply,
            assistantMessageId,
          })
        } else {
          await lifecycle.finalizeFailedReply({
            activeReply,
            assistantMessageId,
            error,
          })
        }
      }

      return false
    } finally {
      setActiveAbortController(null)
      lifecycle.clearActiveReply(assistantMessageId)
    }
  }

  return {
    sendMessage,
    submitEditedMessage,
  }
}
