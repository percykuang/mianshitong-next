'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { useFocusAtEnd } from '@mianshitong/hooks'
import {
  Button,
  CircleCheck,
  Drawer,
  MarkdownRenderer,
  Send,
  Sparkles,
  X,
} from '@mianshitong/ui'

import { type ChatMessageFeedback, type ConversationMessage } from '../types'
import { ChatMessageActions } from './actions'

const LONG_MESSAGE_EDIT_CHAR_THRESHOLD = 600
const LONG_MESSAGE_EDIT_LINE_THRESHOLD = 10
const INLINE_EDITOR_MAX_BUBBLE_HEIGHT_PX = 360
const INLINE_EDITOR_MAX_VIEWPORT_RATIO = 0.38

function shouldUseDrawerEditorForContent(content: string) {
  return (
    content.length > LONG_MESSAGE_EDIT_CHAR_THRESHOLD ||
    content.split(/\r?\n/).length > LONG_MESSAGE_EDIT_LINE_THRESHOLD
  )
}

function getInlineEditorMaxBubbleHeight(viewportHeight: number | null) {
  if (viewportHeight === null) {
    return INLINE_EDITOR_MAX_BUBBLE_HEIGHT_PX
  }

  return Math.min(
    INLINE_EDITOR_MAX_BUBBLE_HEIGHT_PX,
    viewportHeight * INLINE_EDITOR_MAX_VIEWPORT_RATIO
  )
}

export function ChatMessageCard({
  canEditUserMessage = true,
  editingValue = '',
  isFirstMessage = false,
  isEditing = false,
  isStreaming = false,
  message,
  onCancelEditUserMessage,
  onEditingValueChange,
  onFeedbackChange,
  onStartEditUserMessage,
  onSubmitEditUserMessage,
}: {
  canEditUserMessage?: boolean
  editingValue?: string
  isFirstMessage?: boolean
  isEditing?: boolean
  isStreaming?: boolean
  message: ConversationMessage
  onCancelEditUserMessage?: () => void
  onEditingValueChange?: (value: string) => void
  onFeedbackChange?: (feedback: ChatMessageFeedback | null) => void
  onStartEditUserMessage?: () => void
  onSubmitEditUserMessage?: () => void
}) {
  const isUser = message.role === 'user'
  const messageBubbleRef = useRef<HTMLDivElement | null>(null)
  const lockedEditorModeRef = useRef<'drawer' | 'inline' | null>(null)
  const [measuredUserBubbleHeight, setMeasuredUserBubbleHeight] = useState<
    number | null
  >(null)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)
  const hasPoints = Boolean(message.points?.length)
  const shouldUseMeasuredDrawerEditor =
    measuredUserBubbleHeight === null
      ? shouldUseDrawerEditorForContent(message.content)
      : measuredUserBubbleHeight >
        getInlineEditorMaxBubbleHeight(viewportHeight)

  if (!isUser || !isEditing) {
    lockedEditorModeRef.current = null
  } else {
    lockedEditorModeRef.current ??= shouldUseMeasuredDrawerEditor
      ? 'drawer'
      : 'inline'
  }

  const shouldUseDrawerEditor =
    isUser && isEditing && lockedEditorModeRef.current === 'drawer'
  const editingTextareaRef = useFocusAtEnd<HTMLTextAreaElement>(
    isUser && isEditing && !shouldUseDrawerEditor
  )
  const shouldShowActions =
    !isStreaming && (!(isUser && isEditing) || shouldUseDrawerEditor)
  const isInterruptedAssistant =
    !isUser && message.completionStatus === 'interrupted'
  const canSubmitEditingValue = Boolean(editingValue.trim())
  const userShellClassName =
    'ml-auto max-w-[calc(100%-2.5rem)] items-end sm:max-w-[76%] md:gap-3 lg:max-w-[72%]'
  const userBubbleClassName =
    'max-w-full self-end overflow-hidden rounded-2xl bg-(--mst-color-primary) px-3 py-2 text-left text-white'

  useLayoutEffect(() => {
    const syncViewportHeight = () => {
      setViewportHeight(window.innerHeight)
    }

    syncViewportHeight()
    window.addEventListener('resize', syncViewportHeight)

    return () => {
      window.removeEventListener('resize', syncViewportHeight)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isUser) {
      return
    }

    const element = messageBubbleRef.current

    if (!element) {
      return
    }

    const measureBubbleHeight = () => {
      setMeasuredUserBubbleHeight(
        Math.ceil(element.getBoundingClientRect().height)
      )
    }

    measureBubbleHeight()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureBubbleHeight)

      return () => {
        window.removeEventListener('resize', measureBubbleHeight)
      }
    }

    const resizeObserver = new ResizeObserver(measureBubbleHeight)
    resizeObserver.observe(element)

    window.addEventListener('resize', measureBubbleHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureBubbleHeight)
    }
  }, [isUser, message.content])

  useLayoutEffect(() => {
    if (!isUser || !isEditing || shouldUseDrawerEditor) {
      return
    }

    const element = editingTextareaRef.current

    if (!element) {
      return
    }

    // Match the displayed message height instead of capping long edits, so the
    // scroll container does not get clamped to the new bottom on edit.
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [
    editingTextareaRef,
    editingValue,
    isEditing,
    isUser,
    shouldUseDrawerEditor,
  ])

  const handleEditingTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return
    }

    event.preventDefault()

    if (canSubmitEditingValue) {
      onSubmitEditUserMessage?.()
    }
  }

  if (isUser && isEditing && !shouldUseDrawerEditor) {
    return (
      <article
        className="group/message flex w-full justify-end"
        data-message-id={message.id}
      >
        <div className="flex w-full max-w-[calc(100%-2.5rem)] flex-col gap-2 sm:max-w-[76%] md:gap-3 lg:max-w-[72%]">
          <div className="flex w-full items-end gap-2 md:gap-3">
            <button
              aria-label="取消编辑"
              className="mb-0.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-(--mst-color-text-muted) transition-colors duration-200 hover:bg-slate-900/4 hover:text-(--mst-color-text-primary) dark:hover:bg-white/6"
              onClick={onCancelEditUserMessage}
              type="button"
            >
              <X className="size-5" />
            </button>

            <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 shadow-[0_10px_26px_rgb(22_119_255/0.08)] ring-1 ring-(--mst-color-primary) transition-shadow duration-200 ring-inset focus-within:shadow-[0_14px_30px_rgb(22_119_255/0.12)] dark:bg-(--mst-color-bg-elevated)">
              <textarea
                aria-label="编辑消息"
                className="block w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-sm leading-5 text-(--mst-color-text-primary) shadow-none outline-hidden placeholder:text-(--mst-color-text-muted)"
                onChange={(event) => onEditingValueChange?.(event.target.value)}
                onKeyDown={handleEditingTextareaKeyDown}
                placeholder="编辑消息..."
                ref={editingTextareaRef}
                rows={1}
                value={editingValue}
              />
            </div>

            <button
              aria-label="提交编辑"
              className="mb-0.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-(--mst-color-primary) text-white shadow-[0_10px_22px_rgb(22_119_255/0.24)] transition-[transform,filter,background-color] duration-200 hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              disabled={!canSubmitEditingValue}
              onClick={onSubmitEditUserMessage}
              type="button"
            >
              <Send className="size-4" />
            </button>
          </div>

          <div
            aria-hidden
            className="pointer-events-none invisible flex items-center justify-end gap-1 text-(--mst-color-text-muted)"
          >
            <ChatMessageActions
              canEditUserMessage={canEditUserMessage}
              content={message.content}
              feedback={message.feedback}
              isUserMessage={isUser}
            />
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <article className="group/message w-full" data-message-id={message.id}>
        <div
          className={`flex w-full items-start gap-2 md:gap-3 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          {!isUser ? (
            <span
              className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-white/88 text-(--mst-color-primary) shadow-(--mst-shadow-sm) backdrop-blur-sm dark:bg-slate-950/76 ${
                isFirstMessage ? '-mt-1' : '-mt-0.5'
              }`}
            >
              <Sparkles className="size-3.5" />
            </span>
          ) : null}

          <div
            className={`flex flex-col gap-2 ${
              isUser
                ? userShellClassName
                : `min-w-0 flex-1 pr-1 md:gap-4 md:pr-6 ${
                    isFirstMessage ? 'pt-0' : 'pt-0.5'
                  }`
            }`}
          >
            <div
              ref={isUser ? messageBubbleRef : undefined}
              className={`flex flex-col gap-2 text-sm ${
                isUser
                  ? userBubbleClassName
                  : 'bg-transparent px-0 py-0 text-left text-(--mst-color-text-primary)'
              }`}
            >
              {isUser ? (
                <div className="wrap-break-word whitespace-pre-wrap text-white select-text">
                  {message.content}
                </div>
              ) : (
                <MarkdownRenderer
                  content={message.content}
                  streaming={isStreaming}
                />
              )}
            </div>

            {hasPoints ? (
              isUser ? (
                <div className="rounded-2xl bg-white/12 px-4 py-3">
                  <ul className="space-y-2.5 text-sm leading-6 text-white/88">
                    {message.points?.map((point) => (
                      <li className="flex items-start gap-2.5" key={point}>
                        <CircleCheck className="mt-1 size-4 shrink-0 text-white/82" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className="space-y-2.5 pl-1 text-sm leading-6 text-(--mst-color-text-secondary)">
                  {message.points?.map((point) => (
                    <li className="flex items-start gap-2.5" key={point}>
                      <CircleCheck className="mt-1 size-4 shrink-0 text-(--mst-color-primary)" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {isInterruptedAssistant ? (
              <p className="text-xs leading-5 text-(--mst-color-text-muted)">
                已停止生成
              </p>
            ) : null}

            {shouldShowActions ? (
              <div
                aria-hidden={shouldUseDrawerEditor ? true : undefined}
                className={`flex items-center gap-1 text-(--mst-color-text-muted) ${
                  isUser ? 'justify-end' : 'justify-start'
                } ${
                  shouldUseDrawerEditor ? 'pointer-events-none invisible' : ''
                }`}
              >
                <ChatMessageActions
                  canEditUserMessage={
                    canEditUserMessage && (!isEditing || shouldUseDrawerEditor)
                  }
                  content={message.content}
                  feedback={message.feedback}
                  isUserMessage={isUser}
                  onFeedbackChange={onFeedbackChange}
                  onStartEditUserMessage={onStartEditUserMessage}
                />
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {shouldUseDrawerEditor ? (
        <Drawer
          autoFocus={false}
          className="overflow-hidden rounded-l-3xl"
          destroyOnHidden
          footer={
            <div className="flex justify-end gap-2 border-t border-(--mst-color-border-default) bg-white px-4 py-3 dark:bg-(--mst-color-bg-elevated)">
              <Button htmlType="button" onClick={onCancelEditUserMessage}>
                取消
              </Button>
              <Button
                disabled={!canSubmitEditingValue}
                htmlType="button"
                onClick={onSubmitEditUserMessage}
                variant="primary"
              >
                确定
              </Button>
            </div>
          }
          keyboard
          onClose={onCancelEditUserMessage}
          open
          placement="right"
          closable={false}
          styles={{
            body: {
              padding: 0,
            },
            footer: {
              padding: 0,
            },
          }}
          title="编辑消息"
          width="min(560px, calc(100vw - 24px))"
        >
          <div className="flex h-full min-h-0 flex-col bg-white p-4 dark:bg-(--mst-color-bg-elevated)">
            <div className="min-h-0 flex-1 rounded-[18px] bg-white p-3 shadow-[0_10px_26px_rgb(22_119_255/0.08)] ring-1 ring-(--mst-color-primary) ring-inset dark:bg-(--mst-color-bg-page)">
              <textarea
                aria-label="编辑消息"
                className="block h-full min-h-80 w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm leading-5 text-(--mst-color-text-primary) shadow-none outline-hidden placeholder:text-(--mst-color-text-muted)"
                onChange={(event) => onEditingValueChange?.(event.target.value)}
                onKeyDown={handleEditingTextareaKeyDown}
                placeholder="编辑消息..."
                value={editingValue}
              />
            </div>
          </div>
        </Drawer>
      ) : null}
    </>
  )
}
