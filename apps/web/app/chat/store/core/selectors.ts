'use client'

import { getSessionById, projectReplyOntoSession } from './helpers'
import { type ActiveReply, type ChatStore } from './types'

const projectedSelectedSessionCache: {
  activeReply: ActiveReply | null
  result: ReturnType<typeof getSelectedSession>
  selectedSession: ReturnType<typeof getSelectedSession>
} = {
  activeReply: null,
  result: null,
  selectedSession: null,
}

export function isReplying(activeReply: ActiveReply | null) {
  return (
    activeReply?.status === 'awaiting-first-chunk' ||
    activeReply?.status === 'streaming' ||
    activeReply?.status === 'stopping'
  )
}

export function getSelectedSession(
  state: Pick<ChatStore, 'selectedSessionId' | 'sessions'>
) {
  return getSessionById(state.sessions, state.selectedSessionId)
}

export function getProjectedSelectedSession(
  state: Pick<ChatStore, 'activeReply' | 'selectedSessionId' | 'sessions'>
) {
  const selectedSession = getSelectedSession(state)
  const { activeReply } = state

  if (
    projectedSelectedSessionCache.activeReply === activeReply &&
    projectedSelectedSessionCache.selectedSession === selectedSession
  ) {
    return projectedSelectedSessionCache.result
  }

  const result = selectedSession
    ? projectReplyOntoSession(selectedSession, activeReply)
    : null

  projectedSelectedSessionCache.activeReply = activeReply
  projectedSelectedSessionCache.selectedSession = selectedSession
  projectedSelectedSessionCache.result = result

  return result
}

export function getIsReplying(state: Pick<ChatStore, 'activeReply'>) {
  return isReplying(state.activeReply)
}

export function getShowThinkingIndicator(
  state: Pick<ChatStore, 'activeReply'>
) {
  return state.activeReply?.status === 'awaiting-first-chunk'
}

export function getStreamingMessageId(state: Pick<ChatStore, 'activeReply'>) {
  return state.activeReply ? state.activeReply.assistantMessageId : null
}
