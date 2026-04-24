'use client'

import { ChevronLeft, Menu, ThemeToggler } from '@mianshitong/ui'

interface ChatMainPaneHeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export function ChatMainPaneHeader({
  onToggleSidebar,
  sidebarOpen,
}: ChatMainPaneHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-2.5 py-1 md:px-4 md:py-1.5">
      <button
        aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
        className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-slate-900/8 bg-white/76 px-3 text-(--mst-color-text-secondary) shadow-(--mst-shadow-sm) backdrop-blur-sm transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:bg-slate-950/66 dark:hover:bg-white/6"
        onClick={onToggleSidebar}
        type="button"
      >
        {sidebarOpen ? (
          <ChevronLeft className="size-4" />
        ) : (
          <Menu className="size-4" />
        )}
      </button>

      <ThemeToggler bordered className="ml-auto" />
    </header>
  )
}
