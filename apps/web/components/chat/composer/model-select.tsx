'use client'

import { useRef, useState } from 'react'

import {
  Check,
  ChevronDown,
  Popover,
  type PopoverPlacement,
  Sparkles,
} from '@mianshitong/ui'

import type { ChatModelId, ChatModelOption } from '../types'

interface ComposerModelSelectProps {
  disabled?: boolean
  onChange: (value: ChatModelId) => void
  options: readonly ChatModelOption[]
  value: ChatModelId
}

export function ComposerModelSelect({
  disabled = false,
  onChange,
  options,
  value,
}: ComposerModelSelectProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const selectedModel =
    options.find((option) => option.id === value) ?? options[0] ?? null

  if (!selectedModel) {
    return <div className="h-8 w-28" />
  }

  const handleSelect = (nextValue: ChatModelId) => {
    onChange(nextValue)
    setOpen(false)
  }

  const toggleOpen = () => {
    setOpen((current) => !current)
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`切换模型，当前为 ${selectedModel.label}`}
        className="inline-flex h-8 max-w-[min(52vw,14rem)] cursor-pointer items-center gap-2 rounded-[6px_6px_6px_12px] px-2 text-(--mst-color-text-primary) transition-colors duration-200 hover:bg-slate-900/4 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/6"
        disabled={disabled}
        onClick={toggleOpen}
        ref={triggerRef}
        type="button"
      >
        <Sparkles className="size-4 shrink-0 text-(--mst-color-text-primary)" />
        <span className="hidden truncate text-xs font-medium sm:block">
          {selectedModel.label}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-(--mst-color-text-muted) transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <Popover
        anchorRef={triggerRef}
        className="min-w-64 rounded-(--mst-radius-lg) border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) p-1 shadow-(--mst-shadow-lg)"
        offset={4}
        onOpenChange={setOpen}
        open={open}
        placement={'top-start' satisfies PopoverPlacement}
      >
        <div className="flex flex-col gap-1">
          {options.map((option) => {
            const active = option.id === value

            return (
              <button
                className={`cursor-pointer rounded-md px-3 py-2 text-left transition-colors ${
                  active
                    ? 'bg-slate-900/4 text-(--mst-color-text-primary) dark:bg-white/6'
                    : 'text-(--mst-color-text-primary) hover:bg-slate-900/4 dark:hover:bg-white/6'
                }`}
                key={option.id}
                onClick={() => handleSelect(option.id)}
                type="button"
              >
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center pt-0.5 text-(--mst-color-primary)">
                    {active ? <Check className="size-3.5" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">
                      {option.label}
                    </div>
                    {option.description ? (
                      <div className="mt-px text-[10px] leading-tight text-(--mst-color-text-muted)">
                        {option.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Popover>
    </>
  )
}
