import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

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
  return (
    <div {...props} className={cn('space-y-2', className)}>
      {label ? (
        <label className="block text-sm font-medium text-(--mst-color-text-primary)">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-(--mst-color-danger)">{error}</p>
      ) : hint ? (
        <p className="text-xs text-(--mst-color-text-muted)">{hint}</p>
      ) : null}
    </div>
  )
}
