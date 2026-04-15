'use client'

import {
  type ChatMessageCompletionStatus,
  type ChatSessionPreview,
} from '@/components'
import {
  appendAssistantDraftToSession,
  finalizeAssistantMessageInSession,
} from '../../utils'
import { sortSessions } from '../../utils'
import { type ActiveReply } from './types'

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

export function getSessionById(
  sessions: ChatSessionPreview[],
  sessionId: string | null
) {
  return sessionId
    ? (sessions.find((session) => session.id === sessionId) ?? null)
    : null
}

export function getLastEditableUserMessageId(
  session: ChatSessionPreview | null
) {
  return (
    [...(session?.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'user')?.id ?? null
  )
}

export function projectReplyOntoSession(
  session: ChatSessionPreview,
  activeReply: ActiveReply | null
) {
  if (
    !activeReply ||
    activeReply.sessionId !== session.id ||
    !activeReply.latestContent.trim()
  ) {
    return session
  }

  return appendAssistantDraftToSession({
    content: activeReply.latestContent,
    messageId: activeReply.assistantMessageId,
    session,
  })
}

export function commitActiveReplyToSession(input: {
  activeReply: ActiveReply
  completionStatus: ChatMessageCompletionStatus
  session: ChatSessionPreview
}) {
  if (!input.activeReply.latestContent.trim()) {
    return input.session
  }

  return finalizeAssistantMessageInSession({
    completionStatus: input.completionStatus,
    messageId: input.activeReply.assistantMessageId,
    session: projectReplyOntoSession(input.session, input.activeReply),
  })
}
