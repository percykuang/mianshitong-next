'use client'

import {
  Button,
  CircleCheck,
  MarkdownRenderer,
  Sparkles,
  Textarea,
} from '@mianshitong/ui'
import { type ChatMessageFeedback, type ConversationMessage } from './data'
import { ChatMessageActions } from './message-actions'

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
  const hasPoints = Boolean(message.points?.length)
  const shouldShowActions = !isStreaming && !(isUser && isEditing)

  return (
    <article className="group/message w-full">
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
              ? 'ml-auto max-w-[calc(100%-2.5rem)] items-end sm:max-w-[76%] md:gap-3 lg:max-w-[72%]'
              : `min-w-0 flex-1 pr-1 md:gap-4 md:pr-6 ${
                  isFirstMessage ? 'pt-0' : 'pt-0.5'
                }`
          }`}
        >
          <div
            className={`flex flex-col gap-2 text-sm ${
              isUser
                ? isEditing
                  ? 'w-full max-w-xl self-end rounded-2xl border border-(--mst-color-border-default) bg-white p-2 text-left text-(--mst-color-text-primary)'
                  : 'max-w-full self-end overflow-hidden rounded-2xl bg-(--mst-color-primary) px-3 py-2 text-left text-white'
                : 'bg-transparent px-0 py-0 text-left text-(--mst-color-text-primary)'
            }`}
          >
            {isUser && isEditing ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  className="resize-none border-0! bg-transparent px-2 py-1 text-sm shadow-none ring-0! outline-hidden"
                  onChange={(event) =>
                    onEditingValueChange?.(event.target.value)
                  }
                  value={editingValue}
                />
                <div className="flex items-center justify-end gap-2 px-1 pb-1">
                  <Button
                    htmlType="button"
                    onClick={onCancelEditUserMessage}
                    size="sm"
                    variant="ghost"
                  >
                    取消
                  </Button>
                  <Button
                    htmlType="button"
                    onClick={onSubmitEditUserMessage}
                    size="sm"
                    variant="primary"
                  >
                    保存
                  </Button>
                </div>
              </div>
            ) : isUser ? (
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

          {shouldShowActions ? (
            <div
              className={`flex items-center gap-1 text-(--mst-color-text-muted) ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <ChatMessageActions
                canEditUserMessage={canEditUserMessage && !isEditing}
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
  )
}
