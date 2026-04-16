import {
  type ChatMessageFeedback,
  type ChatSessionPreview,
} from '@/app/chat/domain'
import { sortSessions } from './chat-session.utils'

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

export function updateMessageFeedbackInSession(input: {
  feedback: ChatMessageFeedback | null | undefined
  messageId: string
  session: ChatSessionPreview
}) {
  return {
    ...input.session,
    messages: input.session.messages.map((message) =>
      message.id === input.messageId
        ? {
            ...message,
            feedback: input.feedback ?? undefined,
          }
        : message
    ),
  }
}

export function updateMessageFeedbackInSessions(
  sessions: ChatSessionPreview[],
  input: {
    feedback: ChatMessageFeedback | null | undefined
    messageId: string
    sessionId: string
  }
) {
  const currentSession =
    sessions.find((session) => session.id === input.sessionId) ?? null

  if (!currentSession) {
    return sessions
  }

  return replaceSession(
    sessions,
    input.sessionId,
    updateMessageFeedbackInSession({
      feedback: input.feedback,
      messageId: input.messageId,
      session: currentSession,
    })
  )
}
