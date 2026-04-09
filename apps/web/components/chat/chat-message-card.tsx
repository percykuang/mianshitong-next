'use client'

import { CircleCheck, MoreHorizontal, Sparkles } from '@mianshitong/ui'
import { type ConversationMessage } from './chat-data'

export function ChatMessageCard({
  isFirstMessage = false,
  message,
}: {
  isFirstMessage?: boolean
  message: ConversationMessage
}) {
  const isUser = message.role === 'user'

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
            <Sparkles className="size-4" />
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
            className={`flex flex-col gap-2 overflow-hidden text-sm ${
              isUser
                ? 'max-w-full self-end rounded-3xl bg-(--mst-color-primary) px-4 py-1.5 text-left text-white shadow-[0_16px_34px_rgb(15_108_189/0.18)]'
                : 'rounded-(--mst-radius-xl) border border-(--mst-color-border-default) bg-white/74 px-4 py-3 text-left text-(--mst-color-text-primary) shadow-(--mst-shadow-sm) backdrop-blur-md dark:bg-slate-950/58'
            }`}
          >
            {!isUser ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-(--mst-color-text-primary)">
                    {message.label}
                  </p>
                  <p className="mt-0.5 text-xs text-(--mst-color-text-muted)">
                    {message.timestamp}
                  </p>
                </div>
                <button
                  aria-label="更多操作"
                  className="inline-flex size-7 items-center justify-center rounded-full text-(--mst-color-text-muted) opacity-100 transition-[color,background-color,opacity] hover:bg-slate-900/4 hover:text-(--mst-color-primary) md:opacity-0 md:group-hover/message:opacity-100 dark:hover:bg-white/6"
                  type="button"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            ) : null}

            <div
              className={`whitespace-pre-wrap text-sm leading-7 ${
                isUser
                  ? 'wrap-break-word text-[15px] text-white select-text'
                  : 'text-[15px] text-(--mst-color-text-primary) select-text'
              }`}
            >
              {message.content}
            </div>

            {message.points?.length ? (
              <div
                className={`rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-white/12'
                    : 'mt-1 border border-(--mst-color-border-default) bg-slate-900/3 dark:bg-white/4'
                }`}
              >
                <ul
                  className={`space-y-2.5 text-sm leading-6 ${
                    isUser
                      ? 'text-white/88'
                      : 'text-(--mst-color-text-secondary)'
                  }`}
                >
                  {message.points.map((point) => (
                    <li className="flex items-start gap-2.5" key={point}>
                      <CircleCheck
                        className={`mt-1 size-4 shrink-0 ${
                          isUser
                            ? 'text-white/82'
                            : 'text-(--mst-color-primary)'
                        }`}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
