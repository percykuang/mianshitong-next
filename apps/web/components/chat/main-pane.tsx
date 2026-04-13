'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { ChevronDown, ChevronLeft, Menu } from '@mianshitong/ui'
import { ChatComposer } from './composer'
import {
  type ChatModelId,
  type ChatMessageFeedback,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
  type ConversationMessage,
} from './data'
import { ChatEmptyState } from './empty-state'
import { ChatMessageCard } from './message-card'
import { ChatThinkingMessage } from './thinking-message'

const BOTTOM_THRESHOLD_PX = 96

function isNearBottom(element: HTMLElement) {
  return (
    element.scrollHeight - element.clientHeight - element.scrollTop <=
    BOTTOM_THRESHOLD_PX
  )
}

export function ChatMainPane({
  activeSessionId,
  draft,
  hasConversationMessages,
  isReplying,
  editingMessageId,
  editingValue,
  modelOptions,
  messages,
  onCancelEditUserMessage,
  onModelChange,
  onDraftChange,
  onEditingValueChange,
  onMessageFeedbackChange,
  onSelectPrompt,
  onStartEditUserMessage,
  onStop,
  onSubmit,
  onSubmitEditUserMessage,
  onToggleSidebar,
  runtimeDebugInfo,
  showThinkingIndicator,
  selectedModelId,
  sidebarOpen,
  streamingMessageId,
  textareaRef,
}: {
  activeSessionId: string | null
  draft: string
  hasConversationMessages: boolean
  isReplying: boolean
  editingMessageId: string | null
  editingValue: string
  modelOptions: readonly ChatModelOption[]
  messages: ConversationMessage[]
  onCancelEditUserMessage: () => void
  onModelChange: (value: ChatModelId) => void
  onDraftChange: (value: string) => void
  onEditingValueChange: (value: string) => void
  onMessageFeedbackChange: (
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) => void
  onSelectPrompt: (prompt: string) => void
  onStartEditUserMessage: (messageId: string, content: string) => void
  onStop: () => void
  onSubmit: () => void
  onSubmitEditUserMessage: () => void
  onToggleSidebar: () => void
  runtimeDebugInfo: ChatRuntimeDebugInfo | null
  showThinkingIndicator: boolean
  selectedModelId: ChatModelId
  sidebarOpen: boolean
  streamingMessageId: string | null
  textareaRef: RefObject<HTMLTextAreaElement | null>
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const pendingAutoScrollFrameRef = useRef<number | null>(null)
  const previousScrollTopRef = useRef(0)
  const followPausedRef = useRef(false)
  const hasMountedRef = useRef(false)
  const previousSessionIdRef = useRef<string | null>(activeSessionId)
  const previousMessageCountRef = useRef(messages.length)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)
  const showEmptyState = !hasConversationMessages && !isReplying
  const showScrollToBottomButton = hasConversationMessages && !isPinnedToBottom

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
      messages.length - previousMessageCountRef.current
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
    previousMessageCountRef.current = messages.length
  }, [activeSessionId, isPinnedToBottom, isReplying, messages, scrollToBottom])

  return (
    <main
      className={`relative flex h-dvh min-h-0 w-full flex-1 flex-col overflow-hidden bg-white transition-[margin] duration-200 ease-linear dark:bg-(--mst-color-bg-page) ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-0'
      }`}
    >
      <div className="overscroll-behavior-contain relative flex h-dvh min-w-0 touch-pan-y flex-col bg-white dark:bg-(--mst-color-bg-page)">
        <header className="flex h-14 shrink-0 items-center gap-2 px-2.5 py-1 md:px-4 md:py-1.5">
          <button
            aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
            className="cursor-pointer inline-flex h-10 items-center justify-center rounded-full border border-slate-900/8 bg-white/76 px-3 text-(--mst-color-text-secondary) shadow-(--mst-shadow-sm) backdrop-blur-sm transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:bg-slate-950/66 dark:hover:bg-white/6"
            onClick={onToggleSidebar}
            type="button"
          >
            {sidebarOpen ? (
              <ChevronLeft className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>

          {process.env.NODE_ENV === 'development' && runtimeDebugInfo ? (
            <div className="inline-flex min-h-10 max-w-[min(56vw,560px)] items-center rounded-full border border-[rgb(22_119_255/0.14)] bg-[rgb(22_119_255/0.06)] px-3 py-2 text-xs leading-5 text-[rgb(9_89_217)] shadow-[0_1px_2px_rgb(15_23_42/0.04)] dark:border-[rgb(102_168_255/0.22)] dark:bg-[rgb(8_47_73/0.32)] dark:text-[rgb(145_213_255)]">
              <span className="truncate">
                {`调试中：${runtimeDebugInfo.displayTarget} · ${runtimeDebugInfo.actualModel}`}
              </span>
            </div>
          ) : null}
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className="absolute inset-0 touch-pan-y overflow-y-auto"
            ref={scrollContainerRef}
          >
            <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6 px-3 py-4 md:px-6 md:pt-6 md:pb-4">
              {showEmptyState ? <ChatEmptyState /> : null}

              {messages.map((message, index) => (
                <ChatMessageCard
                  canEditUserMessage={!isReplying}
                  editingValue={editingValue}
                  isFirstMessage={index === 0}
                  isEditing={editingMessageId === message.id}
                  isStreaming={message.id === streamingMessageId}
                  key={message.id}
                  message={message}
                  onCancelEditUserMessage={onCancelEditUserMessage}
                  onEditingValueChange={onEditingValueChange}
                  onFeedbackChange={(feedback) =>
                    onMessageFeedbackChange(message.id, feedback)
                  }
                  onStartEditUserMessage={() =>
                    onStartEditUserMessage(message.id, message.content)
                  }
                  onSubmitEditUserMessage={onSubmitEditUserMessage}
                />
              ))}

              {showThinkingIndicator ? <ChatThinkingMessage /> : null}

              <div aria-hidden="true" className="min-h-6 min-w-6 shrink-0" />
            </div>
          </div>

          {showScrollToBottomButton ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center pb-3 md:pb-4">
              <button
                aria-label="回到底部"
                className="pointer-events-auto inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-(--mst-color-border-default) bg-white/90 text-(--mst-color-text-secondary) shadow-[0_8px_18px_rgb(15_23_42/0.16)] backdrop-blur-sm transition-colors duration-200 hover:bg-white dark:bg-slate-900/88 dark:text-zinc-300 dark:hover:bg-slate-900"
                onClick={() => {
                  followPausedRef.current = false
                  scrollToBottom('auto')
                  syncPinnedState(true)
                }}
                type="button"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-4xl px-2 pb-3 md:px-4 md:pb-4">
          <ChatComposer
            draft={draft}
            isReplying={isReplying}
            modelOptions={modelOptions}
            onModelChange={onModelChange}
            onDraftChange={onDraftChange}
            onSelectPrompt={onSelectPrompt}
            onStop={onStop}
            onSubmit={onSubmit}
            selectedModelId={selectedModelId}
            showQuickPrompts={showEmptyState}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </main>
  )
}
