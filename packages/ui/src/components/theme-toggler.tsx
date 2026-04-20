'use client'

import { Moon, Sun } from '@mianshitong/icons'
import { cn } from '@mianshitong/shared'

import { useThemeMode } from '../providers/app-ui-provider'

export interface ThemeTogglerProps {
  bordered?: boolean
  className?: string
  iconClassName?: string
}

export function ThemeToggler({
  bordered = false,
  className,
  iconClassName = 'size-4',
}: ThemeTogglerProps) {
  const { toggleThemeMode } = useThemeMode()

  return (
    <button
      aria-label="切换主题"
      className={cn(
        'inline-flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
        bordered
          ? 'border border-slate-900/8 bg-white/76 text-(--mst-color-text-secondary) shadow-(--mst-shadow-sm) backdrop-blur-sm hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:bg-slate-950/66 dark:hover:bg-white/6'
          : 'border border-transparent bg-transparent text-(--mst-color-text-primary) hover:bg-slate-900/5 hover:text-(--mst-color-primary) dark:hover:bg-white/6',
        className
      )}
      onClick={toggleThemeMode}
      type="button"
    >
      <Sun className={`hidden dark:block ${iconClassName}`} />
      <Moon className={`block dark:hidden ${iconClassName}`} />
    </button>
  )
}
