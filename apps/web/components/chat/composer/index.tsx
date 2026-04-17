'use client'

import type { KeyboardEvent, MouseEvent, RefObject } from 'react'
import { Send } from '@mianshitong/ui'
import { quickPrompts } from '../constants'
import {
  type ChatModelId,
  type ChatModelOption,
  type ChatUsageSummary,
} from '../types'
import { ComposerModelSelect } from './model-select'
import { ComposerUsage } from './usage'

export function ChatComposer({
  draft,
  isReplying,
  modelOptions,
  onModelChange,
  onDraftChange,
  onSelectPrompt,
  onStop,
  onSubmit,
  selectedModelId,
  showQuickPrompts,
  textareaRef,
  usage,
  usageError,
  usageLoading,
}: {
  draft: string
  isReplying: boolean
  modelOptions: readonly ChatModelOption[]
  onModelChange: (value: ChatModelId) => void
  onDraftChange: (value: string) => void
  onSelectPrompt: (prompt: string) => void
  onStop: () => void
  onSubmit: () => void
  selectedModelId: ChatModelId
  showQuickPrompts: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  usage: ChatUsageSummary | null
  usageError: boolean
  usageLoading: boolean
}) {
  const quotaExhausted = usage ? usage.used >= usage.max : false

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

  function preventButtonFocusSteal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
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
              className="flex h-auto w-full cursor-pointer justify-center rounded-full border border-(--mst-color-border-default) bg-white/88 p-3 text-left text-sm font-medium leading-relaxed whitespace-normal text-(--mst-color-text-secondary) shadow-[0_1px_2px_rgb(15_23_42/0.03)] transition-[background-color,border-color,color,box-shadow] duration-200 hover:border-[rgb(15_23_42/0.08)] hover:bg-slate-900/4 hover:text-(--mst-color-text-primary) hover:shadow-[0_2px_6px_rgb(15_23_42/0.06),inset_0_1px_0_rgb(255_255_255/0.72)] disabled:cursor-not-allowed disabled:opacity-55 dark:bg-slate-950/60 dark:hover:border-white/10 dark:hover:bg-white/6 dark:hover:shadow-[0_2px_8px_rgb(2_8_23/0.2)]"
              disabled={quotaExhausted || isReplying}
              key={prompt}
              onMouseDown={preventButtonFocusSteal}
              onClick={() => onSelectPrompt(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="relative w-full overflow-hidden rounded-xl border border-(--mst-color-border-default) bg-[linear-gradient(180deg,rgb(255_255_255/0.06)_0%,rgb(255_255_255/0.18)_12%,rgb(255_255_255/0.54)_32%,rgb(255_255_255/0.86)_62%,rgb(255_255_255/0.94)_100%)] p-3 shadow-[0_14px_38px_rgb(15_23_42/0.08),0_2px_10px_rgb(15_23_42/0.04)] backdrop-blur-md transition-[border-color,background-image,box-shadow] duration-200 hover:border-[rgb(15_23_42/0.12)] hover:bg-[linear-gradient(180deg,rgb(255_255_255/0.08)_0%,rgb(255_255_255/0.22)_12%,rgb(255_255_255/0.58)_32%,rgb(255_255_255/0.88)_62%,rgb(255_255_255/0.96)_100%)] hover:shadow-[0_16px_40px_rgb(15_23_42/0.09),0_4px_12px_rgb(15_23_42/0.05)] focus-within:border-[rgb(22_119_255/0.28)] focus-within:bg-[linear-gradient(180deg,rgb(255_255_255/0.1)_0%,rgb(255_255_255/0.24)_12%,rgb(255_255_255/0.62)_32%,rgb(255_255_255/0.9)_62%,rgb(255_255_255/0.97)_100%)] focus-within:shadow-[0_12px_26px_rgb(22_119_255/0.08),0_4px_10px_rgb(15_23_42/0.05)] focus-within:hover:border-[rgb(22_119_255/0.28)] focus-within:hover:bg-[linear-gradient(180deg,rgb(255_255_255/0.1)_0%,rgb(255_255_255/0.24)_12%,rgb(255_255_255/0.62)_32%,rgb(255_255_255/0.9)_62%,rgb(255_255_255/0.97)_100%)] focus-within:hover:shadow-[0_12px_26px_rgb(22_119_255/0.08),0_4px_10px_rgb(15_23_42/0.05)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgb(2_6_23/0.06)_0%,rgb(2_6_23/0.18)_14%,rgb(2_6_23/0.45)_34%,rgb(2_6_23/0.78)_62%,rgb(2_6_23/0.9)_100%)] dark:shadow-[0_18px_40px_rgb(2_8_23/0.34)] dark:hover:border-white/14 dark:hover:bg-[linear-gradient(180deg,rgb(2_6_23/0.08)_0%,rgb(2_6_23/0.22)_14%,rgb(2_6_23/0.5)_34%,rgb(2_6_23/0.8)_62%,rgb(2_6_23/0.92)_100%)] dark:focus-within:border-[rgb(102_168_255/0.3)] dark:focus-within:bg-[linear-gradient(180deg,rgb(2_6_23/0.1)_0%,rgb(2_6_23/0.24)_14%,rgb(2_6_23/0.54)_34%,rgb(2_6_23/0.84)_62%,rgb(2_6_23/0.94)_100%)] dark:focus-within:shadow-[0_14px_30px_rgb(8_47_73/0.24)] dark:focus-within:hover:border-[rgb(102_168_255/0.3)] dark:focus-within:hover:bg-[linear-gradient(180deg,rgb(2_6_23/0.1)_0%,rgb(2_6_23/0.24)_14%,rgb(2_6_23/0.54)_34%,rgb(2_6_23/0.84)_62%,rgb(2_6_23/0.94)_100%)] dark:focus-within:hover:shadow-[0_14px_30px_rgb(8_47_73/0.24)]"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="absolute top-3 right-3 z-10">
          <ComposerUsage
            usage={usage}
            usageError={usageError}
            usageLoading={usageLoading}
          />
        </div>

        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <textarea
            className="w-full grow resize-none rounded-none border-none! bg-transparent p-2 pr-10 text-sm text-(--mst-color-text-primary) shadow-none ring-0 outline-hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-20 placeholder:text-(--mst-color-text-muted) focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none dark:bg-transparent [&::-webkit-scrollbar]:hidden"
            name="message"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="发消息..."
            ref={textareaRef}
            value={draft}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ComposerModelSelect
              disabled={isReplying}
              onChange={onModelChange}
              options={modelOptions}
              value={selectedModelId}
            />
            <p className="hidden pl-1 text-xs text-(--mst-color-text-muted) sm:block">
              Enter 发送，Shift + Enter 换行
            </p>
          </div>

          {isReplying ? (
            <button
              aria-label="停止生成"
              className="cursor-pointer inline-flex size-8 items-center justify-center rounded-full bg-(--mst-color-primary) text-white transition-colors duration-200 hover:brightness-95 dark:bg-(--mst-color-primary)"
              onMouseDown={preventButtonFocusSteal}
              onClick={onStop}
              type="button"
            >
              <span className="size-2 rounded-xs bg-current" />
            </button>
          ) : (
            <button
              aria-label="发送消息"
              className="cursor-pointer inline-flex size-8 items-center justify-center rounded-full bg-(--mst-color-primary) text-white transition-colors duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              disabled={!draft.trim() || isReplying || quotaExhausted}
              onMouseDown={preventButtonFocusSteal}
              type="submit"
            >
              <Send className="size-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
