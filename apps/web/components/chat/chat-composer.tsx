'use client'

import type { KeyboardEvent, RefObject } from 'react'
import { Send } from '@mianshitong/ui'
import { quickPrompts } from './chat-data'

export function ChatComposer({
  draft,
  isReplying,
  onDraftChange,
  onSelectPrompt,
  onSubmit,
  showQuickPrompts,
  textareaRef,
}: {
  draft: string
  isReplying: boolean
  onDraftChange: (value: string) => void
  onSelectPrompt: (prompt: string) => void
  onSubmit: () => void
  showQuickPrompts: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
}) {
  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return
    }

    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="relative flex w-full flex-col gap-4">
      {showQuickPrompts ? (
        <div
          className="grid w-full gap-2 sm:grid-cols-2"
          data-testid="suggested-actions"
          style={{ animation: 'chat-shell-fade-up 620ms ease-out both' }}
        >
          {quickPrompts.map((prompt) => (
            <button
              className="flex h-auto w-full cursor-pointer justify-center rounded-full border border-(--mst-color-border-default) bg-white/78 p-3 text-left text-sm font-medium leading-relaxed whitespace-normal text-(--mst-color-text-secondary) shadow-(--mst-shadow-sm) backdrop-blur-sm transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:-translate-y-px hover:border-(--mst-color-primary) hover:bg-white/92 hover:text-(--mst-color-text-primary) hover:shadow-(--mst-shadow-md) dark:bg-slate-950/60 dark:hover:bg-slate-950/76"
              key={prompt}
              onClick={() => onSelectPrompt(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="relative w-full overflow-hidden rounded-(--mst-radius-xl) border border-(--mst-color-border-default) bg-white/84 p-3 shadow-(--mst-shadow-md) backdrop-blur-xl transition-all duration-200 hover:border-slate-900/12 focus-within:border-(--mst-color-primary) focus-within:shadow-(--mst-shadow-lg) dark:bg-slate-950/72"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <textarea
            className="w-full grow resize-none rounded-none border-none! bg-transparent p-2 pr-10 text-sm text-(--mst-color-text-primary) shadow-none ring-0 outline-hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-24 placeholder:text-(--mst-color-text-muted) focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none dark:bg-transparent [&::-webkit-scrollbar]:hidden"
            disabled={isReplying}
            name="message"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="发消息..."
            ref={textareaRef}
            value={draft}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="pl-2 text-xs text-(--mst-color-text-muted) opacity-100">
            {isReplying
              ? 'AI 正在组织回答...'
              : 'Enter 发送，Shift + Enter 换行'}
          </p>

          <button
            aria-label="发送消息"
            className="cursor-pointer inline-flex size-9 items-center justify-center rounded-full bg-(--mst-color-primary) text-white shadow-(--mst-shadow-sm) transition-all duration-200 hover:-translate-y-px hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            disabled={!draft.trim() || isReplying}
            type="submit"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
