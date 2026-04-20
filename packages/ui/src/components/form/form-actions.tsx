import type { HTMLAttributes } from 'react'

import { cn } from '@mianshitong/shared'

export type FormActionsProps = HTMLAttributes<HTMLDivElement>

export function FormActions({ className, ...props }: FormActionsProps) {
  return (
    <div
      {...props}
      className={cn('flex flex-wrap items-center justify-end gap-3', className)}
    />
  )
}
