'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

const BOTTOM_THRESHOLD_PX = 96

function isNearBottom(element: HTMLElement) {
  return (
    element.scrollHeight - element.clientHeight - element.scrollTop <=
    BOTTOM_THRESHOLD_PX
  )
}

interface UseChatMainPaneScrollOptions {
  activeSessionId: string | null
  isReplying: boolean
  messageCount: number
}

export function useChatMainPaneScroll({
  activeSessionId,
  isReplying,
  messageCount,
}: UseChatMainPaneScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const pendingAutoScrollFrameRef = useRef<number | null>(null)
  const previousScrollTopRef = useRef(0)
  const followPausedRef = useRef(false)
  const hasMountedRef = useRef(false)
  const previousSessionIdRef = useRef<string | null>(activeSessionId)
  const previousMessageCountRef = useRef(messageCount)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)

  const syncPinnedState = useCallback((nextValue: boolean) => {
    setIsPinnedToBottom((previousValue) =>
      previousValue === nextValue ? previousValue : nextValue
    )
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const element = scrollContainerRef.current

    if (!element) {
      return
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior,
    })
  }, [])

  const handleScrollToBottom = useCallback(() => {
    followPausedRef.current = false
    scrollToBottom('auto')
    syncPinnedState(true)
  }, [scrollToBottom, syncPinnedState])

  useEffect(() => {
    return () => {
      if (pendingAutoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingAutoScrollFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const element = scrollContainerRef.current

    if (!element) {
      return
    }

    previousScrollTopRef.current = element.scrollTop

    const handleScroll = () => {
      const currentScrollTop = element.scrollTop
      const isUserScrollingUp =
        currentScrollTop < previousScrollTopRef.current - 1
      previousScrollTopRef.current = currentScrollTop

      const nearBottom = isNearBottom(element)

      if (followPausedRef.current) {
        if (nearBottom) {
          followPausedRef.current = false
          syncPinnedState(true)
        } else {
          syncPinnedState(false)
        }
        return
      }

      if (isReplying && isUserScrollingUp) {
        followPausedRef.current = true
        syncPinnedState(false)
        return
      }

      syncPinnedState(nearBottom)
    }

    handleScroll()
    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [activeSessionId, isReplying, syncPinnedState])

  useLayoutEffect(() => {
    const isFirstRender = !hasMountedRef.current
    const isSessionChanged = previousSessionIdRef.current !== activeSessionId
    const messageDelta = Math.abs(
      messageCount - previousMessageCountRef.current
    )
    const shouldForceAutoScroll =
      isFirstRender || isSessionChanged || messageDelta > 1
    const shouldFollow =
      shouldForceAutoScroll || (isPinnedToBottom && !followPausedRef.current)

    if (pendingAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingAutoScrollFrameRef.current)
      pendingAutoScrollFrameRef.current = null
    }

    if (shouldFollow) {
      scrollToBottom(shouldForceAutoScroll || isReplying ? 'auto' : 'smooth')

      if (shouldForceAutoScroll) {
        pendingAutoScrollFrameRef.current = window.requestAnimationFrame(() => {
          pendingAutoScrollFrameRef.current = null
          scrollToBottom('auto')
        })
      }
    }

    hasMountedRef.current = true

    if (isSessionChanged) {
      followPausedRef.current = false
    }

    previousSessionIdRef.current = activeSessionId
    previousMessageCountRef.current = messageCount
  }, [
    activeSessionId,
    isPinnedToBottom,
    isReplying,
    messageCount,
    scrollToBottom,
  ])

  return {
    isPinnedToBottom,
    scrollContainerRef,
    scrollToBottom: handleScrollToBottom,
  }
}
