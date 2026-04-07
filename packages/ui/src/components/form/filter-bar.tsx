import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type FilterBarProps = HTMLAttributes<HTMLDivElement>

export function FilterBar({ className, ...props }: FilterBarProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-[var(--mst-radius-md)] border border-[var(--mst-color-border-default)] bg-[var(--mst-color-bg-surface)] p-4',
        className
      )}
    />
  )
}
