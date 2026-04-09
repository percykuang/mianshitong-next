'use client'

import { Sparkles } from '@mianshitong/ui'

export function ChatThinkingMessage() {
  return (
    <article className="group/message w-full">
      <div className="flex w-full items-start gap-2 md:gap-3">
        <span
          className="inline-flex size-8 shrink-0 -mt-0.5 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-white/88 text-[rgb(138_146_160)] shadow-(--mst-shadow-sm) backdrop-blur-sm dark:bg-slate-950/76 dark:text-slate-300"
          style={{
            animation: 'chat-shell-thinking-avatar 2.4s ease-in-out infinite',
          }}
        >
          <Sparkles className="size-3.5" />
        </span>

        <div className="min-w-0 flex-1 pt-0.5 pr-1 md:pr-6">
          <div className="flex min-h-6 items-center gap-1 rounded-2xl bg-transparent px-0 py-0 text-left text-(--mst-color-text-primary)">
            <span className="text-[12px] leading-5 font-normal tracking-[0.01em] text-[rgb(182_189_201)] dark:text-slate-500">
              正在组织回答
            </span>

            <span
              aria-hidden="true"
              className="inline-flex items-center gap-1 text-[rgb(182_189_201)] dark:text-slate-500"
            >
              {[0, 1, 2].map((index) => (
                <span
                  className="inline-flex size-0.5 rounded-full bg-current opacity-30"
                  key={index}
                  style={{
                    animation: `chat-shell-thinking-dot 1.1s ease-in-out ${
                      index * 0.16
                    }s infinite`,
                  }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
