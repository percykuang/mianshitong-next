import { cn } from '@mianshitong/shared'
import type { HTMLAttributes, ReactNode } from 'react'

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

export function FormField({
  label,
  hint,
  error,
  className,
  children,
  ...props
}: FormFieldProps) {
  const message = error ?? hint

  return (
    <div {...props} className={cn('grid gap-2', className)}>
      {label ? (
        <label className="block text-sm font-medium text-(--mst-color-text-primary)">
          {label}
        </label>
      ) : null}
      {children}
      {message ? (
        <p
          aria-live={error ? 'polite' : undefined}
          className={cn(
            'text-xs leading-4',
            error
              ? 'text-(--mst-color-danger)'
              : 'text-(--mst-color-text-muted)',
            'visible'
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
