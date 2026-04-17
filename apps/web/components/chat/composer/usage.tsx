'use client'

import { Popover, type PopoverPlacement } from '@mianshitong/ui'
import { useRef, useState } from 'react'
import type { ChatUsageSummary } from '../types'

function UsageTriggerIcon({ percent }: { percent: number }) {
  const normalizedPercent = Number.isFinite(percent)
    ? Math.min(100, Math.max(0, percent))
    : 0
  const radius = 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (normalizedPercent / 100) * circumference

  return (
    <svg
      aria-hidden="true"
      className="size-7"
      height="28"
      viewBox="0 0 24 24"
      width="28"
    >
      <circle
        cx="12"
        cy="12"
        fill="none"
        opacity="0.25"
        r={radius}
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        fill="none"
        opacity="0.7"
        r={radius}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth="2"
        transform="rotate(-90 12 12)"
      />
    </svg>
  )
}

export function ComposerUsage({
  usage,
  usageError = false,
  usageLoading = false,
}: {
  usage?: ChatUsageSummary | null
  usageError?: boolean
  usageLoading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const usageUnavailable = usageError && !usageLoading && !usage
  const usagePercent =
    usage && usage.max > 0
      ? Math.min(100, (usage.used / usage.max) * 100)
      : usage
        ? 100
        : 0
  const usagePercentLabel =
    usageLoading && !usage
      ? '--.-%'
      : usageUnavailable
        ? '--'
        : `${usagePercent.toFixed(1)}%`
  const usedCountLabel =
    usageLoading && !usage
      ? '--'
      : usageUnavailable
        ? '--'
        : String(usage?.used ?? 0)
  const totalCountLabel =
    usageLoading && !usage
      ? '--'
      : usageUnavailable
        ? '--'
        : String(usage?.max ?? 0)

  return (
    <>
      <button
        aria-label={`查看今日额度使用情况：${usagePercentLabel}`}
        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-white text-(--mst-color-primary) transition-colors duration-200 hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-950"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <UsageTriggerIcon percent={usagePercent} />
      </button>

      <Popover
        anchorRef={triggerRef}
        className="w-66.5 rounded-lg border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) p-3 shadow-(--mst-shadow-lg)"
        offset={8}
        onOpenChange={setOpen}
        open={open}
        placement={'top-end' satisfies PopoverPlacement}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-tight text-(--mst-color-text-primary)">
              {usagePercentLabel}
            </span>
            <span className="text-sm font-medium text-(--mst-color-text-muted)">
              {usedCountLabel} / {totalCountLabel} 次
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-slate-900/6 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-(--mst-color-primary) transition-[width] duration-300"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="space-y-1.5 text-sm text-(--mst-color-text-secondary)">
            <div className="flex items-center justify-between">
              <span>已用次数</span>
              <span>{usedCountLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>总次数</span>
              <span>{totalCountLabel}</span>
            </div>
            {usageUnavailable ? (
              <div className="pt-1 text-xs text-(--mst-color-text-muted)">
                额度加载失败，请稍后重试
              </div>
            ) : null}
          </div>
        </div>
      </Popover>
    </>
  )
}
