'use client'

import { isFetchTypeError } from '@mianshitong/shared'
import { type ChatRuntimeDebugInfo } from '@/components'
import {
  createAssistantFallbackMessage,
  getPersistedChatSession,
  persistInterruptedChatReply,
} from '../../utils'
import {
  commitActiveReplyToSession,
  getSessionById,
  hydratePersistedSession,
  replaceSession,
} from '../core/helpers'
import {
  type ActiveReply,
  type ChatStoreGetState,
  type ChatStoreSetState,
} from '../core/types'

export interface ChatReplyLifecycle {
  clearActiveReply: (assistantMessageId: string) => void
  finalizeCompletedReply: (input: {
    activeReply: ActiveReply
    assistantMessageId: string
  }) => void
  finalizeFailedReply: (input: {
    activeReply: ActiveReply
    assistantMessageId: string
    error: unknown
  }) => Promise<void>
  finalizeInterruptedReply: (input: {
    activeReply: ActiveReply
    assistantMessageId: string
  }) => Promise<void>
  hydrateSession: (
    sessionId: string,
    optimisticSessionId: string
  ) => Promise<void>
  syncReplyChunk: (assistantMessageId: string, latestContent: string) => void
  syncReplyResult: (input: {
    assistantMessageId: string
    content: string
    runtimeDebugInfo: ChatRuntimeDebugInfo
  }) => void
}

interface CreateChatReplyLifecycleInput {
  get: ChatStoreGetState
  set: ChatStoreSetState
}

export function createChatReplyLifecycle({
  get,
  set,
}: CreateChatReplyLifecycleInput): ChatReplyLifecycle {
  async function hydrateSession(
    sessionId: string,
    optimisticSessionId: string
  ) {
    try {
      const persistedSession = await getPersistedChatSession(sessionId)

      set((state) => ({
        pendingSidebarSessionId:
          state.pendingSidebarSessionId === optimisticSessionId ||
          state.pendingSidebarSessionId === persistedSession.id
            ? null
            : state.pendingSidebarSessionId,
        selectedSessionId: persistedSession.id,
        sessions: hydratePersistedSession(
          state.sessions,
          optimisticSessionId,
          persistedSession
        ),
      }))
    } catch (error) {
      console.warn('[chat-store] hydrate persisted session failed', error)
      set((state) => ({
        pendingSidebarSessionId:
          state.pendingSidebarSessionId === optimisticSessionId ||
          state.pendingSidebarSessionId === sessionId
            ? null
            : state.pendingSidebarSessionId,
      }))
    }
  }

  function clearActiveReply(assistantMessageId: string) {
    set((state) =>
      state.activeReply?.assistantMessageId === assistantMessageId
        ? { activeReply: null }
        : state
    )
  }

  function syncReplyChunk(assistantMessageId: string, latestContent: string) {
    set((state) =>
      state.activeReply?.assistantMessageId === assistantMessageId
        ? {
            activeReply: {
              ...state.activeReply,
              latestContent,
              status: 'streaming',
            },
          }
        : state
    )
  }

  function syncReplyResult(input: {
    assistantMessageId: string
    content: string
    runtimeDebugInfo: ChatRuntimeDebugInfo
  }) {
    set((state) => ({
      activeReply:
        state.activeReply?.assistantMessageId === input.assistantMessageId
          ? {
              ...state.activeReply,
              latestContent: input.content,
              status: 'streaming',
            }
          : state.activeReply,
      runtimeDebugInfoByModelId: {
        ...state.runtimeDebugInfoByModelId,
        [input.runtimeDebugInfo.requestedModelId]: input.runtimeDebugInfo,
      },
    }))
  }

  async function finalizeInterruptedReply(input: {
    activeReply: ActiveReply
    assistantMessageId: string
  }) {
    const currentState = get()
    const currentSession = getSessionById(
      currentState.sessions,
      input.activeReply.sessionId
    )

    if (!currentSession || !input.activeReply.latestContent.trim()) {
      return
    }

    const interruptedSession = commitActiveReplyToSession({
      activeReply: input.activeReply,
      completionStatus: 'interrupted',
      session: currentSession,
    })

    set((state) => {
      const nextState = {
        sessions: replaceSession(
          state.sessions,
          interruptedSession.id,
          interruptedSession
        ),
      }

      return nextState
    })

    if (!currentState.persistenceEnabled) {
      clearActiveReply(input.assistantMessageId)
      return
    }

    try {
      const persistedSession = await persistInterruptedChatReply({
        content: input.activeReply.latestContent.trim(),
        expectedMessageCount: currentSession.messages.length,
        sessionId: interruptedSession.id,
      })

      set((state) => ({
        activeReply:
          state.activeReply?.assistantMessageId === input.assistantMessageId
            ? null
            : state.activeReply,
        selectedSessionId: persistedSession.id,
        pendingSidebarSessionId:
          state.pendingSidebarSessionId ===
            (input.activeReply.optimisticSessionId ?? persistedSession.id) ||
          state.pendingSidebarSessionId === persistedSession.id
            ? null
            : state.pendingSidebarSessionId,
        sessions: hydratePersistedSession(
          state.sessions,
          input.activeReply.optimisticSessionId ?? persistedSession.id,
          persistedSession
        ),
      }))
    } catch (error) {
      console.warn('[chat-store] persist interrupted reply failed', error)
      clearActiveReply(input.assistantMessageId)
    }
  }

  async function finalizeFailedReply(input: {
    activeReply: ActiveReply
    assistantMessageId: string
    error: unknown
  }) {
    if (input.activeReply.latestContent.trim()) {
      await finalizeInterruptedReply(input)
      return
    }

    if (input.activeReply.mode === 'edit') {
      if (get().persistenceEnabled) {
        await hydrateSession(
          input.activeReply.sessionId,
          input.activeReply.optimisticSessionId ?? input.activeReply.sessionId
        )
      }

      return
    }

    const currentState = get()
    const currentSession = getSessionById(
      currentState.sessions,
      input.activeReply.sessionId
    )

    if (!currentSession) {
      return
    }

    if (isFetchTypeError(input.error)) {
      console.warn(
        '[chat-store] send message fetch failed, fallback message rendered'
      )
    } else {
      console.error('[chat-store] send message failed', input.error)
    }

    const fallbackMessage = createAssistantFallbackMessage()
    const fallbackSession = {
      ...currentSession,
      preview: fallbackMessage.content,
      messages: [...currentSession.messages, fallbackMessage],
    }

    set((state) => ({
      activeReply:
        state.activeReply?.assistantMessageId === input.assistantMessageId
          ? null
          : state.activeReply,
      sessions: replaceSession(
        state.sessions,
        fallbackSession.id,
        fallbackSession
      ),
    }))
  }

  function finalizeCompletedReply(input: {
    activeReply: ActiveReply
    assistantMessageId: string
  }) {
    const currentState = get()
    const currentSession = getSessionById(
      currentState.sessions,
      input.activeReply.sessionId
    )

    if (!currentSession || !input.activeReply.latestContent.trim()) {
      return
    }

    const completedSession = commitActiveReplyToSession({
      activeReply: input.activeReply,
      completionStatus: 'completed',
      session: currentSession,
    })

    set((state) => {
      const nextState = {
        sessions: replaceSession(
          state.sessions,
          completedSession.id,
          completedSession
        ),
      }

      return state.activeReply?.assistantMessageId === input.assistantMessageId
        ? {
            ...nextState,
            activeReply: null,
          }
        : nextState
    })
  }

  return {
    clearActiveReply,
    finalizeCompletedReply,
    finalizeFailedReply,
    finalizeInterruptedReply,
    hydrateSession,
    syncReplyChunk,
    syncReplyResult,
  }
}
