import type { HTMLAttributes } from 'react'

import { cn } from '@mianshitong/shared/ui'

export type SurfaceProps = HTMLAttributes<HTMLDivElement>

export function Surface({ className, ...props }: SurfaceProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-(--mst-radius-lg) border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) shadow-(--mst-shadow-sm)',
        className
      )}
    />
  )
}
