'use client'

import { useEffect, useRef } from 'react'
import { type ChatSessionPreview } from '@/components'
import { buildChatPath } from '../../utils'

export function useChatSessionSelectionRouteSyncEffect(input: {
  isReplying: boolean
  pathname: string
  routeSessionId: string | null
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  onSelectRouteNewSession: () => void
  onSelectRouteSession: (sessionId: string) => void
}) {
  const {
    isReplying,
    onSelectRouteNewSession,
    onSelectRouteSession,
    pathname,
    routeSessionId,
    selectedSessionId,
    sessions,
  } = input
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    const pathChanged = previousPathnameRef.current !== pathname
    previousPathnameRef.current = pathname

    if (routeSessionId === selectedSessionId) {
      return
    }

    if (routeSessionId === null) {
      if (!pathChanged || isReplying) {
        return
      }

      onSelectRouteNewSession()
      return
    }

    if (!sessions.some((session) => session.id === routeSessionId)) {
      onSelectRouteNewSession()
      return
    }

    onSelectRouteSession(routeSessionId)
  }, [
    isReplying,
    onSelectRouteNewSession,
    onSelectRouteSession,
    pathname,
    routeSessionId,
    selectedSessionId,
    sessions,
  ])
}

export function useChatPathSyncEffect(input: {
  isReplying: boolean
  pathname: string
  selectedSessionId: string | null
  replacePath: (targetPath: string) => void
}) {
  const { isReplying, pathname, replacePath, selectedSessionId } = input

  useEffect(() => {
    if (isReplying) {
      return
    }

    const targetPath = buildChatPath(selectedSessionId)

    if (targetPath === pathname) {
      return
    }

    replacePath(targetPath)
  }, [isReplying, pathname, replacePath, selectedSessionId])
}
