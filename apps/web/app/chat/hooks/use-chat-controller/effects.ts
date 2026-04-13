'use client'

import { useEffect, useRef } from 'react'
import { type ThemeMode } from '@mianshitong/ui'
import { type ChatSessionPreview } from '@/components'
import { buildChatPath, warmupCodeHighlightForSessions } from '../../utils'

interface IdleHost {
  cancelIdleCallback?: (handle: number) => void
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number
}

function createHighlightWarmupSignature(
  themeMode: ThemeMode,
  sessions: ChatSessionPreview[]
) {
  return `${themeMode}\u0000${sessions
    .map((session) => {
      const lastMessage = session.messages[session.messages.length - 1]

      return `${session.id}:${session.messages.length}:${lastMessage?.id ?? ''}`
    })
    .join('|')}`
}

export function useCodeHighlightWarmupEffect(input: {
  isReplying: boolean
  sessions: ChatSessionPreview[]
  themeMode: ThemeMode
}) {
  const { isReplying, sessions, themeMode } = input
  const highlightWarmupSignatureRef = useRef('')

  useEffect(() => {
    if (isReplying || sessions.length === 0) {
      return
    }

    const warmupSignature = createHighlightWarmupSignature(themeMode, sessions)

    if (highlightWarmupSignatureRef.current === warmupSignature) {
      return
    }

    highlightWarmupSignatureRef.current = warmupSignature
    let ignore = false
    let idleTaskId: number | null = null
    let fallbackTimerId: ReturnType<typeof globalThis.setTimeout> | null = null
    const idleHost = globalThis as typeof globalThis & IdleHost

    const runWarmupTask = () => {
      if (ignore) {
        return
      }

      void warmupCodeHighlightForSessions({
        sessions,
        themeMode,
        shouldContinue: () => !ignore,
      })
    }

    if (typeof idleHost.requestIdleCallback === 'function') {
      idleTaskId = idleHost.requestIdleCallback(
        () => {
          runWarmupTask()
        },
        { timeout: 1200 }
      )
    } else {
      fallbackTimerId = globalThis.setTimeout(() => {
        runWarmupTask()
      }, 120)
    }

    return () => {
      ignore = true

      if (
        idleTaskId !== null &&
        typeof idleHost.cancelIdleCallback === 'function'
      ) {
        idleHost.cancelIdleCallback(idleTaskId)
      }

      if (fallbackTimerId !== null) {
        globalThis.clearTimeout(fallbackTimerId)
      }
    }
  }, [isReplying, sessions, themeMode])
}

export function useChatSessionSelectionRouteSyncEffect(input: {
  isReplying: boolean
  pathname: string
  persistenceEnabled: boolean
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
    persistenceEnabled,
    routeSessionId,
    selectedSessionId,
    sessions,
  } = input
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    const pathChanged = previousPathnameRef.current !== pathname
    previousPathnameRef.current = pathname

    const optimisticSessionPending =
      persistenceEnabled &&
      selectedSessionId?.startsWith('session-') &&
      routeSessionId === null

    if (optimisticSessionPending) {
      return
    }

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
    persistenceEnabled,
    routeSessionId,
    selectedSessionId,
    sessions,
  ])
}

export function useChatPathSyncEffect(input: {
  isReplying: boolean
  pathname: string
  persistenceEnabled: boolean
  selectedSessionId: string | null
  replacePath: (targetPath: string) => void
}) {
  const {
    isReplying,
    pathname,
    persistenceEnabled,
    replacePath,
    selectedSessionId,
  } = input

  useEffect(() => {
    if (isReplying) {
      return
    }

    if (persistenceEnabled && selectedSessionId?.startsWith('session-')) {
      return
    }

    const targetPath = buildChatPath(selectedSessionId)

    if (targetPath === pathname) {
      return
    }

    replacePath(targetPath)
  }, [isReplying, pathname, persistenceEnabled, replacePath, selectedSessionId])
}
