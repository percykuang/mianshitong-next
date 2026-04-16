'use client'

import {
  type ChatMessageCompletionStatus,
  type ChatSessionPreview,
} from '@/app/chat/domain'
import {
  finalizeReplyToSession,
  projectAssistantReplyOntoSession,
} from '../../utils'
export {
  hydratePersistedSession,
  replaceOptimisticSession,
  replaceSession,
  upsertSession,
} from '../../utils'
import { type ActiveReply } from './types'

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

  return projectAssistantReplyOntoSession({
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

  return finalizeReplyToSession({
    content: input.activeReply.latestContent,
    completionStatus: input.completionStatus,
    messageId: input.activeReply.assistantMessageId,
    session: input.session,
  })
}
