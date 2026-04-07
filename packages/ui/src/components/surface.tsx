import type { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type SurfaceProps = HTMLAttributes<HTMLDivElement>

export function Surface({ className, ...props }: SurfaceProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-[var(--mst-radius-lg)] border border-[var(--mst-color-border-default)] bg-[var(--mst-color-bg-surface)] shadow-[var(--mst-shadow-sm)]',
        className
      )}
    />
  )
}
