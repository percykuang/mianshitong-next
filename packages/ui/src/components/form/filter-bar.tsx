import { cn } from '@mianshitong/shared'
import type { HTMLAttributes } from 'react'

export type FilterBarProps = HTMLAttributes<HTMLDivElement>

export function FilterBar({ className, ...props }: FilterBarProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-(--mst-radius-md) border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) p-4',
        className
      )}
    />
  )
}
