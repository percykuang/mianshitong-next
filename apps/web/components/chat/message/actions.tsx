'use client'

import {
  type ComponentProps,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Button,
  Check,
  Copy,
  Pencil,
  ThumbsDown,
  ThumbsDownFill,
  ThumbsUp,
  ThumbsUpFill,
} from '@mianshitong/ui'
import { ConfigProvider } from 'antd'

import type { ChatMessageFeedback } from '../types'

interface CopyButtonProps {
  content: string
  label: string
}

interface ChatMessageActionsProps {
  canEditUserMessage?: boolean
  content: string
  feedback?: ChatMessageFeedback
  isUserMessage: boolean
  onFeedbackChange?: (feedback: ChatMessageFeedback | null) => void
  onStartEditUserMessage?: () => void
}

const actionButtonClassName =
  'border-0! bg-transparent! text-(--mst-color-text-muted) shadow-none! transition-[transform,color,background-color] duration-150 hover:bg-slate-900/4! active:scale-95 dark:hover:bg-white/6!'

const neutralActionButtonClassName = 'hover:text-(--mst-color-text-primary)!'

const feedbackButtonClassName = 'hover:text-(--mst-color-primary)!'

const activeFeedbackButtonClassName =
  'text-(--mst-color-primary)! hover:text-(--mst-color-primary)!'

const feedbackIconClassName =
  'inline-flex items-center justify-center [animation:chat-message-action-icon-pop_160ms_ease-out]'

async function copyMessageContent(content: string) {
  await navigator.clipboard.writeText(content)
}

function ActionButton({
  className = '',
  ...props
}: ComponentProps<typeof Button> & { className?: string }) {
  const preventButtonFocusSteal = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <Button
      className={`${actionButtonClassName} ${className}`.trim()}
      htmlType="button"
      onMouseDown={preventButtonFocusSteal}
      size="sm"
      variant="ghost"
      {...props}
    />
  )
}

function CopyMessageButton({ content, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      await copyMessageContent(content)
      setCopied(true)

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false)
        timeoutRef.current = null
      }, 1500)
    } catch (error) {
      console.error('[chat-message-actions] copy failed', error)
    }
  }

  return (
    <ActionButton
      aria-label={label}
      className={neutralActionButtonClassName}
      data-copy-state={copied ? 'copied' : 'idle'}
      onClick={() => void handleCopy()}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </ActionButton>
  )
}

export function ChatMessageActions({
  canEditUserMessage = true,
  content,
  feedback,
  isUserMessage,
  onFeedbackChange,
  onStartEditUserMessage,
}: ChatMessageActionsProps) {
  if (isUserMessage) {
    return (
      <ConfigProvider wave={{ disabled: true }}>
        <>
          {canEditUserMessage ? (
            <ActionButton
              aria-label="编辑"
              className={neutralActionButtonClassName}
              onClick={onStartEditUserMessage}
            >
              <Pencil className="size-3.5" />
            </ActionButton>
          ) : null}
          <CopyMessageButton content={content} label="复制" />
        </>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider wave={{ disabled: true }}>
      <>
        <CopyMessageButton content={content} label="复制" />
        <ActionButton
          aria-label="点赞"
          aria-pressed={feedback === 'like'}
          className={`${feedbackButtonClassName} ${
            feedback === 'like' ? activeFeedbackButtonClassName : ''
          }`.trim()}
          onClick={() =>
            onFeedbackChange?.(feedback === 'like' ? null : 'like')
          }
        >
          <span
            className={feedbackIconClassName}
            key={feedback === 'like' ? 'upvote-fill' : 'upvote-line'}
          >
            {feedback === 'like' ? (
              <ThumbsUpFill className="size-3.5" />
            ) : (
              <ThumbsUp className="size-3.5" />
            )}
          </span>
        </ActionButton>
        <ActionButton
          aria-label="点踩"
          aria-pressed={feedback === 'dislike'}
          className={`${feedbackButtonClassName} ${
            feedback === 'dislike' ? activeFeedbackButtonClassName : ''
          }`.trim()}
          onClick={() =>
            onFeedbackChange?.(feedback === 'dislike' ? null : 'dislike')
          }
        >
          <span
            className={feedbackIconClassName}
            key={feedback === 'dislike' ? 'downvote-fill' : 'downvote-line'}
          >
            {feedback === 'dislike' ? (
              <ThumbsDownFill className="size-3.5" />
            ) : (
              <ThumbsDown className="size-3.5" />
            )}
          </span>
        </ActionButton>
      </>
    </ConfigProvider>
  )
}
