'use client'

import { createStore } from 'zustand/vanilla'

import { createChatReplyActions } from '../reply/actions'
import { createChatSessionActions } from '../session/actions'
import { type ChatStore, type ChatStoreInitialState } from './types'

export {
  getIsReplying,
  getProjectedSelectedSession,
  getSelectedSession,
  getShowThinkingIndicator,
  getStreamingMessageId,
  isReplying,
} from './selectors'

function createInitialSelectedSessionId(input: ChatStoreInitialState) {
  return input.persistenceEnabled &&
    input.initialSelectedSessionId &&
    input.initialSessions.some(
      (session) => session.id === input.initialSelectedSessionId
    )
    ? input.initialSelectedSessionId
    : null
}

export function createChatStore(input: ChatStoreInitialState) {
  let activeAbortController: AbortController | null = null
  const feedbackMutationVersionByKey = new Map<string, number>()

  return createStore<ChatStore>()((set, get, store) => {
    return {
      activeReply: null,
      draft: '',
      editingMessageId: null,
      editingValue: '',
      pendingSidebarSessionId: null,
      pendingEditedMessageAnchorId: null,
      persistenceEnabled: input.persistenceEnabled,
      selectedModelId: input.initialSelectedModelId,
      selectedSessionId: createInitialSelectedSessionId(input),
      sessions: input.initialSessions,
      ...createChatSessionActions({
        feedbackMutationVersionByKey,
        get,
        set,
      }),
      ...createChatReplyActions({
        get,
        getActiveAbortController: () => activeAbortController,
        set,
        setActiveAbortController(controller) {
          activeAbortController = controller
        },
        subscribe: store.subscribe,
      }),
    }
  })
}
