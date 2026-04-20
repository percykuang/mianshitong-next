'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

const BREAK_FOLLOW_THRESHOLD_PX = 64
const RESUME_FOLLOW_THRESHOLD_PX = 24
const EDITED_MESSAGE_VIEWPORT_PADDING_PX = 16
const SCROLL_LOCK_FRAME_COUNT = 4
const SCROLL_BURST_DELAYS_MS = [80, 180, 320]

function getDistanceFromBottom(element: HTMLElement) {
  return element.scrollHeight - element.clientHeight - element.scrollTop
}

function isNearBottom(element: HTMLElement, threshold: number) {
  return getDistanceFromBottom(element) <= threshold
}

function isWithinResumeThreshold(element: HTMLElement) {
  return isNearBottom(element, RESUME_FOLLOW_THRESHOLD_PX)
}

function shouldBreakFollow(element: HTMLElement) {
  return getDistanceFromBottom(element) > BREAK_FOLLOW_THRESHOLD_PX
}

interface UseChatMainPaneScrollOptions {
  activeSessionId: string | null
  editingMessageId: string | null
  followRequestKey: number
  isReplying: boolean
  lastMessageContent: string | undefined
  messageCount: number
  onEditedMessageAnchorApplied: () => void
  pendingEditedMessageAnchorId: string | null
}

export function useChatMainPaneScroll({
  activeSessionId,
  editingMessageId,
  followRequestKey,
  isReplying,
  lastMessageContent,
  messageCount,
  onEditedMessageAnchorApplied,
  pendingEditedMessageAnchorId,
}: UseChatMainPaneScrollOptions) {
  const scrollContainerElementRef = useRef<HTMLDivElement | null>(null)
  const [scrollContainerElement, setScrollContainerElement] =
    useState<HTMLDivElement | null>(null)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)
  const previousEditingMessageIdRef = useRef<string | null>(editingMessageId)
  const previousFollowRequestKeyRef = useRef(followRequestKey)
  const previousReplyingRef = useRef(isReplying)
  const previousScrollTopRef = useRef(0)
  const previousSessionIdRef = useRef<string | null>(null)
  const pendingSessionScrollRef = useRef<string | null>(null)
  const pendingPinnedStateFrameRef = useRef<number | null>(null)
  const pendingScrollLockFrameRef = useRef<number | null>(null)
  const scrollBurstFrameIdsRef = useRef<number[]>([])
  const scrollBurstTimeoutIdsRef = useRef<number[]>([])
  // 标记当前是否处于“强制跟随到底部”阶段，通常由发送消息、切换会话或主动回到底部触发。
  const followLockRef = useRef(false)
  // 标记当前滚动位置是否仍可视为“贴底”，用于决定是否显示回到底部按钮与是否继续自动跟随。
  const pinnedToBottomRef = useRef(true)

  const syncPinnedState = useCallback((nextValue: boolean) => {
    pinnedToBottomRef.current = nextValue
    setIsPinnedToBottom((previousValue) =>
      previousValue === nextValue ? previousValue : nextValue
    )
  }, [])

  const setPinnedRef = useCallback((nextValue: boolean) => {
    pinnedToBottomRef.current = nextValue
  }, [])

  const clearPendingPinnedStateFrame = useCallback(() => {
    if (pendingPinnedStateFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingPinnedStateFrameRef.current)
      pendingPinnedStateFrameRef.current = null
    }
  }, [])

  const schedulePinnedStateSync = useCallback(
    (nextValue: boolean) => {
      setPinnedRef(nextValue)
      clearPendingPinnedStateFrame()
      pendingPinnedStateFrameRef.current = window.requestAnimationFrame(() => {
        pendingPinnedStateFrameRef.current = null
        setIsPinnedToBottom((previousValue) =>
          previousValue === nextValue ? previousValue : nextValue
        )
      })
    },
    [clearPendingPinnedStateFrame, setPinnedRef]
  )

  const enableFollowLock = useCallback(() => {
    followLockRef.current = true
  }, [])

  const shouldFollow = useCallback(() => {
    return followLockRef.current || pinnedToBottomRef.current
  }, [])

  const syncPinnedStateFromElement = useCallback(
    (element: HTMLElement) => {
      const nextValue = followLockRef.current
        ? true
        : isWithinResumeThreshold(element)

      syncPinnedState(nextValue)
      return nextValue
    },
    [syncPinnedState]
  )

  const scrollContainerRef = useCallback((node: HTMLDivElement | null) => {
    scrollContainerElementRef.current = node
    setScrollContainerElement((previousNode) =>
      previousNode === node ? previousNode : node
    )
  }, [])

  const clearScheduledScrollBurst = useCallback(() => {
    for (const frameId of scrollBurstFrameIdsRef.current) {
      window.cancelAnimationFrame(frameId)
    }
    scrollBurstFrameIdsRef.current = []

    for (const timeoutId of scrollBurstTimeoutIdsRef.current) {
      window.clearTimeout(timeoutId)
    }
    scrollBurstTimeoutIdsRef.current = []
  }, [])

  const clearScrollLock = useCallback(() => {
    if (pendingScrollLockFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingScrollLockFrameRef.current)
      pendingScrollLockFrameRef.current = null
    }
  }, [])

  const performScrollToBottom = useCallback(() => {
    const element = scrollContainerElementRef.current

    if (!element) {
      return
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'auto',
    })
    previousScrollTopRef.current = element.scrollTop
  }, [])

  const scheduleScrollBurstToBottom = useCallback(() => {
    clearScheduledScrollBurst()
    enableFollowLock()
    syncPinnedState(true)

    const run = () => {
      performScrollToBottom()
    }

    run()

    const firstFrameId = window.requestAnimationFrame(() => {
      run()

      const secondFrameId = window.requestAnimationFrame(() => {
        run()
      })
      scrollBurstFrameIdsRef.current.push(secondFrameId)
    })
    scrollBurstFrameIdsRef.current.push(firstFrameId)

    for (const delay of SCROLL_BURST_DELAYS_MS) {
      const timeoutId = window.setTimeout(() => {
        run()
      }, delay)
      scrollBurstTimeoutIdsRef.current.push(timeoutId)
    }
  }, [
    clearScheduledScrollBurst,
    enableFollowLock,
    performScrollToBottom,
    syncPinnedState,
  ])

  const stopFollowing = useCallback(() => {
    followLockRef.current = false
    clearScheduledScrollBurst()
    syncPinnedState(false)
  }, [clearScheduledScrollBurst, syncPinnedState])

  const scrollToBottom = useCallback(() => {
    followLockRef.current = true
    clearScheduledScrollBurst()
    syncPinnedState(true)
    performScrollToBottom()
  }, [clearScheduledScrollBurst, performScrollToBottom, syncPinnedState])

  const keepMessageInViewport = useCallback((messageId: string) => {
    const element = scrollContainerElementRef.current

    if (!element) {
      return
    }

    const targetMessage = element.querySelector<HTMLElement>(
      `[data-message-id="${messageId}"]`
    )

    if (!targetMessage) {
      return
    }

    const containerRect = element.getBoundingClientRect()
    const messageRect = targetMessage.getBoundingClientRect()
    const messageTop = messageRect.top - containerRect.top
    const messageBottom = messageRect.bottom - containerRect.top
    const viewportTop = EDITED_MESSAGE_VIEWPORT_PADDING_PX
    const viewportBottom =
      element.clientHeight - EDITED_MESSAGE_VIEWPORT_PADDING_PX
    let nextScrollTop = element.scrollTop

    if (messageTop < viewportTop) {
      nextScrollTop += messageTop - viewportTop
    } else if (messageBottom > viewportBottom) {
      nextScrollTop += messageBottom - viewportBottom
    }

    const maxScrollTop = Math.max(
      0,
      element.scrollHeight - element.clientHeight
    )
    const normalizedScrollTop = Math.min(
      Math.max(nextScrollTop, 0),
      maxScrollTop
    )

    if (Math.abs(normalizedScrollTop - element.scrollTop) > 1) {
      element.scrollTop = normalizedScrollTop
    }

    previousScrollTopRef.current = element.scrollTop
  }, [])

  const lockScrollTopForNextFrames = useCallback(
    (scrollTop: number) => {
      clearScrollLock()

      let remainingFrames = SCROLL_LOCK_FRAME_COUNT

      const restoreScrollTop = () => {
        const element = scrollContainerElementRef.current

        if (!element) {
          pendingScrollLockFrameRef.current = null
          return
        }

        element.scrollTop = scrollTop
        previousScrollTopRef.current = scrollTop
        remainingFrames -= 1

        if (remainingFrames <= 0) {
          pendingScrollLockFrameRef.current = null
          return
        }

        pendingScrollLockFrameRef.current =
          window.requestAnimationFrame(restoreScrollTop)
      }

      restoreScrollTop()
    },
    [clearScrollLock]
  )

  useEffect(() => {
    return () => {
      clearPendingPinnedStateFrame()
      clearScheduledScrollBurst()
      clearScrollLock()
    }
  }, [clearPendingPinnedStateFrame, clearScheduledScrollBurst, clearScrollLock])

  useLayoutEffect(() => {
    if (!scrollContainerElement) {
      return
    }

    previousScrollTopRef.current = scrollContainerElement.scrollTop
    schedulePinnedStateSync(
      followLockRef.current
        ? true
        : isWithinResumeThreshold(scrollContainerElement)
    )

    const handleScroll = () => {
      const currentScrollTop = scrollContainerElement.scrollTop
      const nearBottom = isWithinResumeThreshold(scrollContainerElement)
      previousScrollTopRef.current = currentScrollTop

      if (followLockRef.current && shouldBreakFollow(scrollContainerElement)) {
        stopFollowing()
        return
      }

      if (followLockRef.current) {
        syncPinnedState(true)
        return
      }

      syncPinnedState(nearBottom)
    }

    scrollContainerElement.addEventListener('scroll', handleScroll, {
      passive: true,
    })

    return () => {
      scrollContainerElement.removeEventListener('scroll', handleScroll)
    }
  }, [
    isReplying,
    schedulePinnedStateSync,
    scrollContainerElement,
    stopFollowing,
    syncPinnedState,
  ])

  useLayoutEffect(() => {
    if (!scrollContainerElement) {
      return
    }

    const content = scrollContainerElement.firstElementChild

    if (!(content instanceof HTMLElement)) {
      return
    }

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      const element = scrollContainerElementRef.current

      if (!element) {
        return
      }

      const nearBottom = syncPinnedStateFromElement(element)

      if (!nearBottom || !followLockRef.current) {
        previousScrollTopRef.current = element.scrollTop
        return
      }

      syncPinnedState(true)
      performScrollToBottom()
    })

    resizeObserver.observe(content)

    return () => {
      resizeObserver.disconnect()
    }
  }, [
    activeSessionId,
    performScrollToBottom,
    scrollContainerElement,
    syncPinnedStateFromElement,
    syncPinnedState,
  ])

  useLayoutEffect(() => {
    const isNewFollowRequest =
      previousFollowRequestKeyRef.current !== followRequestKey
    previousFollowRequestKeyRef.current = followRequestKey

    if (!isNewFollowRequest) {
      return
    }

    enableFollowLock()

    if (pendingEditedMessageAnchorId) {
      onEditedMessageAnchorApplied()
    }

    const frameId = window.requestAnimationFrame(() => {
      scheduleScrollBurstToBottom()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [
    enableFollowLock,
    followRequestKey,
    onEditedMessageAnchorApplied,
    pendingEditedMessageAnchorId,
    scheduleScrollBurstToBottom,
  ])

  useLayoutEffect(() => {
    if (!activeSessionId) {
      previousSessionIdRef.current = null
      pendingSessionScrollRef.current = null
      followLockRef.current = false
      clearScheduledScrollBurst()
      clearScrollLock()
      schedulePinnedStateSync(true)
      return
    }

    const isSessionChanged = previousSessionIdRef.current !== activeSessionId
    previousSessionIdRef.current = activeSessionId

    if (!isSessionChanged) {
      return
    }

    enableFollowLock()
    pendingSessionScrollRef.current = activeSessionId
    const frameId = window.requestAnimationFrame(() => {
      scheduleScrollBurstToBottom()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [
    activeSessionId,
    clearScheduledScrollBurst,
    clearScrollLock,
    enableFollowLock,
    scheduleScrollBurstToBottom,
    schedulePinnedStateSync,
  ])

  useLayoutEffect(() => {
    if (!activeSessionId || !scrollContainerElement) {
      return
    }

    if (pendingSessionScrollRef.current !== activeSessionId) {
      return
    }

    if (isReplying) {
      return
    }

    pendingSessionScrollRef.current = null
    const frameId = window.requestAnimationFrame(() => {
      scheduleScrollBurstToBottom()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [
    activeSessionId,
    isReplying,
    scheduleScrollBurstToBottom,
    scrollContainerElement,
  ])

  useEffect(() => {
    const wasReplying = previousReplyingRef.current
    previousReplyingRef.current = isReplying

    if (isReplying && pendingSessionScrollRef.current === activeSessionId) {
      pendingSessionScrollRef.current = null
      clearScheduledScrollBurst()
    }

    if (isReplying && !wasReplying && shouldFollow()) {
      schedulePinnedStateSync(true)
      performScrollToBottom()
      return
    }

    if (!isReplying && wasReplying) {
      if (shouldFollow()) {
        schedulePinnedStateSync(true)
        performScrollToBottom()
      }

      followLockRef.current = false
    }
  }, [
    activeSessionId,
    clearScheduledScrollBurst,
    isReplying,
    performScrollToBottom,
    schedulePinnedStateSync,
    shouldFollow,
  ])

  useEffect(() => {
    if (!shouldFollow()) {
      return
    }

    schedulePinnedStateSync(true)
    performScrollToBottom()
  }, [
    activeSessionId,
    isReplying,
    lastMessageContent,
    messageCount,
    performScrollToBottom,
    schedulePinnedStateSync,
    shouldFollow,
  ])

  useLayoutEffect(() => {
    const isEditingStateChanged =
      previousEditingMessageIdRef.current !== editingMessageId
    const previousEditingMessageId = previousEditingMessageIdRef.current
    previousEditingMessageIdRef.current = editingMessageId

    if (!isEditingStateChanged) {
      return
    }

    if (
      pendingEditedMessageAnchorId &&
      previousEditingMessageId === pendingEditedMessageAnchorId &&
      !editingMessageId
    ) {
      if (shouldFollow()) {
        onEditedMessageAnchorApplied()
        return
      }

      keepMessageInViewport(pendingEditedMessageAnchorId)
      onEditedMessageAnchorApplied()
      return
    }

    if (shouldFollow()) {
      return
    }

    lockScrollTopForNextFrames(previousScrollTopRef.current)
  }, [
    editingMessageId,
    keepMessageInViewport,
    lockScrollTopForNextFrames,
    onEditedMessageAnchorApplied,
    pendingEditedMessageAnchorId,
    shouldFollow,
  ])

  return {
    isPinnedToBottom,
    scrollContainerRef,
    scrollToBottom,
  }
}
