'use client'

import { CircleCheck, Sparkles } from '@mianshitong/ui'
import { type ConversationMessage } from './data'
import { ChatMarkdown } from './markdown'

export function ChatMessageCard({
  isFirstMessage = false,
  isStreaming = false,
  message,
}: {
  isFirstMessage?: boolean
  isStreaming?: boolean
  message: ConversationMessage
}) {
  const isUser = message.role === 'user'
  const hasPoints = Boolean(message.points?.length)

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
                ? 'max-w-full self-end overflow-hidden rounded-2xl bg-(--mst-color-primary) px-3 py-2 text-left text-white'
                : 'bg-transparent px-0 py-0 text-left text-(--mst-color-text-primary)'
            }`}
          >
            {isUser ? (
              <div className="wrap-break-word whitespace-pre-wrap text-white select-text">
                {message.content}
              </div>
            ) : (
              <ChatMarkdown content={message.content} streaming={isStreaming} />
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
        </div>
      </div>
    </article>
  )
}
