'use client'

import { isReplying } from '../core/selectors'
import { createChatReplyLifecycle } from './lifecycle'
import { createChatReplyStreamActions } from './stream'
import {
  type ChatStoreActions,
  type ChatStoreGetState,
  type ChatStoreSetState,
  type ChatStoreSubscribe,
} from '../core/types'

interface CreateChatReplyActionsInput {
  get: ChatStoreGetState
  getActiveAbortController: () => AbortController | null
  set: ChatStoreSetState
  setActiveAbortController: (controller: AbortController | null) => void
  subscribe: ChatStoreSubscribe
}

export function createChatReplyActions({
  get,
  getActiveAbortController,
  set,
  setActiveAbortController,
  subscribe,
}: CreateChatReplyActionsInput): Pick<
  ChatStoreActions,
  | 'dispose'
  | 'interruptAndNewSession'
  | 'interruptAndSelectSession'
  | 'selectPrompt'
  | 'sendMessage'
  | 'stopReply'
  | 'submitEditedMessage'
> {
  const lifecycle = createChatReplyLifecycle({
    get,
    set,
  })
  const streamActions = createChatReplyStreamActions({
    get,
    lifecycle,
    set,
    setActiveAbortController,
  })
  let navigationRequestVersion = 0

  function stopActiveReply() {
    const activeReply = get().activeReply
    const activeAbortController = getActiveAbortController()

    if (
      !activeAbortController ||
      !activeReply ||
      activeReply.status === 'stopping'
    ) {
      return false
    }

    set({
      activeReply: {
        ...activeReply,
        status: 'stopping',
      },
    })

    activeAbortController.abort()
    return true
  }

  function waitForReplyToClear(assistantMessageId: string) {
    return new Promise<void>((resolve) => {
      const currentAssistantMessageId = get().activeReply?.assistantMessageId

      if (currentAssistantMessageId !== assistantMessageId) {
        resolve()
        return
      }

      let settled = false
      const unsubscribe = subscribe((state, previousState) => {
        if (
          previousState.activeReply?.assistantMessageId ===
            assistantMessageId &&
          state.activeReply?.assistantMessageId !== assistantMessageId
        ) {
          settled = true
          window.clearTimeout(timeoutId)
          unsubscribe()
          resolve()
        }
      })
      const timeoutId = window.setTimeout(() => {
        if (settled) {
          return
        }

        console.warn(
          '[chat-store] wait for interrupted reply settlement timed out'
        )
        unsubscribe()
        resolve()
      }, 8_000)
    })
  }

  async function interruptReplyIfNeeded() {
    const activeReply = get().activeReply

    if (!activeReply || !isReplying(activeReply)) {
      return
    }

    const clearPromise = waitForReplyToClear(activeReply.assistantMessageId)

    if (activeReply.status !== 'stopping') {
      stopActiveReply()
    }

    await clearPromise
  }

  return {
    dispose() {
      getActiveAbortController()?.abort()
      setActiveAbortController(null)
    },

    async interruptAndNewSession() {
      const requestVersion = ++navigationRequestVersion

      await interruptReplyIfNeeded()

      if (requestVersion !== navigationRequestVersion) {
        return
      }

      set({
        draft: '',
        editingMessageId: null,
        editingValue: '',
        pendingSidebarSessionId: null,
        selectedSessionId: null,
      })
    },

    async interruptAndSelectSession(sessionId) {
      const requestVersion = ++navigationRequestVersion

      await interruptReplyIfNeeded()

      if (requestVersion !== navigationRequestVersion) {
        return
      }

      set({
        editingMessageId: null,
        editingValue: '',
        selectedSessionId: sessionId,
      })
    },

    async selectPrompt(prompt) {
      if (isReplying(get().activeReply)) {
        return
      }

      await get().sendMessage(prompt)
    },

    sendMessage: streamActions.sendMessage,

    stopReply() {
      stopActiveReply()
    },

    submitEditedMessage: streamActions.submitEditedMessage,
  }
}
