'use client'

import { type ChatSessionPreview } from '@/components'
import { appendAssistantDraftToSession, sortSessions } from '../../utils'
import {
  type AppendFallbackMessageOptions,
  type UpdateAssistantDraftOptions,
} from './types'

function dedupeSessionsById(sessions: ChatSessionPreview[]) {
  return sessions.filter(
    (session, index, currentSessions) =>
      currentSessions.findIndex(
        (currentSession) => currentSession.id === session.id
      ) === index
  )
}

export function upsertSession(
  sessions: ChatSessionPreview[],
  sessionId: string,
  nextSession: ChatSessionPreview
) {
  return sortSessions(
    sessions.some((session) => session.id === sessionId)
      ? sessions.map((session) =>
          session.id === sessionId ? nextSession : session
        )
      : [...sessions, nextSession]
  )
}

export function replaceSession(
  sessions: ChatSessionPreview[],
  sessionId: string,
  nextSession: ChatSessionPreview
) {
  return sortSessions(
    sessions.map((session) =>
      session.id === sessionId ? nextSession : session
    )
  )
}

export function replaceOptimisticSession(
  sessions: ChatSessionPreview[],
  optimisticSessionId: string,
  nextSession: ChatSessionPreview
) {
  return sortSessions(
    dedupeSessionsById(
      sessions.map((session) =>
        session.id === optimisticSessionId ? nextSession : session
      )
    )
  )
}

export function hydratePersistedSession(
  sessions: ChatSessionPreview[],
  optimisticSessionId: string,
  persistedSession: ChatSessionPreview
) {
  return sortSessions(
    dedupeSessionsById(
      sessions.map((session) =>
        session.id === optimisticSessionId || session.id === persistedSession.id
          ? persistedSession
          : session
      )
    )
  )
}

export function updateAssistantDraftInSessions(
  sessions: ChatSessionPreview[],
  {
    content,
    fallbackSession,
    messageId,
    sessionId,
  }: UpdateAssistantDraftOptions
) {
  const currentSession =
    sessions.find((session) => session.id === sessionId) ?? fallbackSession

  return replaceSession(
    sessions,
    sessionId,
    appendAssistantDraftToSession({
      content,
      messageId,
      session: currentSession,
    })
  )
}

export function appendFallbackMessageToSessions(
  sessions: ChatSessionPreview[],
  { fallbackMessage, fallbackSession, sessionId }: AppendFallbackMessageOptions
) {
  const currentSession =
    sessions.find((session) => session.id === sessionId) ?? fallbackSession

  return replaceSession(sessions, sessionId, {
    ...currentSession,
    preview: fallbackMessage.content,
    messages: [...currentSession.messages, fallbackMessage],
  })
}
