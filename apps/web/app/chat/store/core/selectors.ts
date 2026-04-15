'use client'

import { getSessionById, projectReplyOntoSession } from './helpers'
import { type ActiveReply, type ChatStore } from './types'

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

  return selectedSession
    ? projectReplyOntoSession(selectedSession, state.activeReply)
    : null
}

export function getRuntimeDebugInfo(
  state: Pick<ChatStore, 'runtimeDebugInfoByModelId' | 'selectedModelId'>
) {
  return state.runtimeDebugInfoByModelId[state.selectedModelId] ?? null
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
