import Link from 'next/link'
import { cn } from '@mianshitong/shared'
import { MianshitongLogoMark } from '@mianshitong/icons'

export interface AppBrandProps {
  className?: string
  href?: string
  labelClassName?: string
  logoClassName?: string
  showLabel?: boolean
}

export function AppBrand({
  className,
  href = '/',
  labelClassName,
  logoClassName,
  showLabel = true,
}: AppBrandProps) {
  return (
    <Link className={cn('inline-flex items-center', className)} href={href}>
      <MianshitongLogoMark
        aria-hidden="true"
        className={cn('size-8 rounded-lg', logoClassName)}
      />
      {showLabel ? (
        <span
          className={cn(
            'ml-1.5 font-semibold text-lg text-(--mst-color-primary)',
            labelClassName
          )}
        >
          面试通
        </span>
      ) : null}
    </Link>
  )
}
