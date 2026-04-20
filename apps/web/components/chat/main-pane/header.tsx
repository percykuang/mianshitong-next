'use client'

import { ChevronLeft, Menu, ThemeToggler } from '@mianshitong/ui'

import { type ChatRuntimeDebugInfo } from '../types'

interface ChatMainPaneHeaderProps {
  onToggleSidebar: () => void
  runtimeDebugInfo: ChatRuntimeDebugInfo | null
  sidebarOpen: boolean
}

export function ChatMainPaneHeader({
  onToggleSidebar,
  runtimeDebugInfo,
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

      {process.env.NODE_ENV === 'development' && runtimeDebugInfo ? (
        <div className="inline-flex min-h-10 max-w-[min(56vw,560px)] items-center rounded-full border border-[rgb(22_119_255/0.14)] bg-[rgb(22_119_255/0.06)] px-3 py-2 text-xs leading-5 text-[rgb(9_89_217)] shadow-[0_1px_2px_rgb(15_23_42/0.04)] dark:border-[rgb(102_168_255/0.22)] dark:bg-[rgb(8_47_73/0.32)] dark:text-[rgb(145_213_255)]">
          <span className="truncate">
            {`调试中：${runtimeDebugInfo.displayTarget} · ${runtimeDebugInfo.actualModel}`}
          </span>
        </div>
      ) : null}

      <ThemeToggler bordered className="ml-auto" />
    </header>
  )
}
