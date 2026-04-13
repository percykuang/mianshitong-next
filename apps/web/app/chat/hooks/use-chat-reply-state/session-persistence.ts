'use client'

import { createChatSessionTitle, type ChatSessionPreview } from '@/components'
import {
  createNextSession,
  createPersistedChatSession,
  getPersistedChatSession,
} from '../../utils'
import {
  hydratePersistedSession,
  replaceOptimisticSession,
  upsertSession,
} from './session-updates'
import {
  type HydrateReplySessionOptions,
  type PreparedReplySession,
  type PrepareReplySessionOptions,
} from './types'

export async function prepareReplySession({
  input,
  persistenceEnabled,
  selectedModelId,
  selectedSessionId,
  sessions,
  setSelectedSessionId,
  setSessions,
}: PrepareReplySessionOptions): Promise<PreparedReplySession> {
  const optimisticSession = createNextSession({
    input,
    selectedSessionId,
    sessions,
  })
  const optimisticSessionId = optimisticSession.id

  setSelectedSessionId(optimisticSessionId)
  setSessions((currentSessions) =>
    upsertSession(currentSessions, optimisticSessionId, optimisticSession)
  )

  if (!persistenceEnabled || selectedSessionId) {
    return {
      activeSession: optimisticSession,
      activeSessionId: optimisticSessionId,
      optimisticSession,
      optimisticSessionId,
    }
  }

  const createdSession = await createPersistedChatSession({
    modelId: selectedModelId,
    title: createChatSessionTitle(input),
  })
  const persistedSession: ChatSessionPreview = {
    ...optimisticSession,
    id: createdSession.id,
    createdAt: createdSession.createdAt,
    pinned: createdSession.pinned,
    pinnedAt: createdSession.pinnedAt,
    title: createdSession.title,
  }

  setSelectedSessionId(persistedSession.id)
  setSessions((currentSessions) =>
    replaceOptimisticSession(
      currentSessions,
      optimisticSessionId,
      persistedSession
    )
  )

  return {
    activeSession: persistedSession,
    activeSessionId: persistedSession.id,
    optimisticSession,
    optimisticSessionId,
  }
}

export async function hydrateReplySession({
  optimisticSessionId,
  persistenceEnabled,
  sessionId,
  setSelectedSessionId,
  setSessions,
}: HydrateReplySessionOptions) {
  if (!persistenceEnabled || !sessionId) {
    return
  }

  try {
    const persistedSession = await getPersistedChatSession(sessionId)

    setSelectedSessionId(persistedSession.id)
    setSessions((currentSessions) =>
      hydratePersistedSession(
        currentSessions,
        optimisticSessionId,
        persistedSession
      )
    )
  } catch (error) {
    console.warn('[chat-reply] hydrate persisted session failed', error)
  }
}
