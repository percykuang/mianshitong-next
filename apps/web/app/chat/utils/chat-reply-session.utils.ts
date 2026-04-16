import { type ChatSessionPreview } from '@/app/chat/domain'
import { createAssistantFallbackMessage } from './chat-message.utils'
import { hydratePersistedSession } from './chat-session-collection.utils'

function clearPendingSidebarSessionId(
  pendingSidebarSessionId: string | null,
  sessionIds: string[]
) {
  return sessionIds.includes(pendingSidebarSessionId ?? '')
    ? null
    : pendingSidebarSessionId
}

export function createFallbackReplySession(session: ChatSessionPreview) {
  const fallbackMessage = createAssistantFallbackMessage()

  return {
    ...session,
    preview: fallbackMessage.content,
    messages: [...session.messages, fallbackMessage],
  }
}

export function buildPersistedReplySessionState(input: {
  optimisticSessionId: string
  pendingSidebarSessionId: string | null
  persistedSession: ChatSessionPreview
  sessions: ChatSessionPreview[]
}) {
  return {
    pendingSidebarSessionId: clearPendingSidebarSessionId(
      input.pendingSidebarSessionId,
      [input.optimisticSessionId, input.persistedSession.id]
    ),
    selectedSessionId: input.persistedSession.id,
    sessions: hydratePersistedSession(
      input.sessions,
      input.optimisticSessionId,
      input.persistedSession
    ),
  }
}

export function buildPersistedReplySessionFailureState(input: {
  optimisticSessionId: string
  pendingSidebarSessionId: string | null
  sessionId: string
}) {
  return {
    pendingSidebarSessionId: clearPendingSidebarSessionId(
      input.pendingSidebarSessionId,
      [input.optimisticSessionId, input.sessionId]
    ),
  }
}

export function clearPendingReplySidebarSession(input: {
  pendingSidebarSessionId: string | null
  sessionId: string
}) {
  return clearPendingSidebarSessionId(input.pendingSidebarSessionId, [
    input.sessionId,
  ])
}
