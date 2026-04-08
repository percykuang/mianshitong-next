import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface PageHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  heading: ReactNode
  description?: ReactNode
  extra?: ReactNode
}

export function PageHeader({
  heading,
  description,
  extra,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-wrap items-start justify-between gap-4',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-(--mst-color-text-primary)">
          {heading}
        </h1>
        {description ? (
          <p className="text-sm text-(--mst-color-text-secondary)">
            {description}
          </p>
        ) : null}
      </div>
      {extra ? <div>{extra}</div> : null}
    </div>
  )
}
