'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronDown,
  Dropdown,
  Moon,
  Sun,
  User,
  X,
  useThemeMode,
} from '@mianshitong/ui'

interface ChatSidebarUserMenuProps {
  onLogout: () => void
  userEmail: string | null
}

export function ChatSidebarUserMenu({
  onLogout,
  userEmail,
}: ChatSidebarUserMenuProps) {
  const { toggleThemeMode, themeMode } = useThemeMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAuthenticated = Boolean(userEmail)

  return (
    <Dropdown
      destroyOnHidden
      menu={{ items: [] }}
      onOpenChange={setMenuOpen}
      open={menuOpen}
      placement="topRight"
      popupRender={() => (
        <div className="w-full rounded-(--mst-radius-xl) border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) p-1.5 shadow-(--mst-shadow-lg)">
          <button
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-(--mst-radius-lg) px-2.5 py-1 text-left text-[13px] text-(--mst-color-text-primary) transition-colors hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:hover:bg-white/6"
            onClick={() => {
              setMenuOpen(false)
              toggleThemeMode()
            }}
            type="button"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) text-(--mst-color-primary)">
              {themeMode === 'dark' ? (
                <Sun className="size-3.5" />
              ) : (
                <Moon className="size-3.5" />
              )}
            </span>
            <span>
              {themeMode === 'dark' ? '切换浅色主题' : '切换深色主题'}
            </span>
          </button>

          <div className="my-1.5 border-t border-(--mst-color-border-default)" />

          {isAuthenticated ? (
            <button
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-(--mst-radius-lg) px-2.5 py-1 text-left text-[13px] text-red-500 transition-colors hover:bg-red-500/8"
              onClick={() => {
                setMenuOpen(false)
                onLogout()
              }}
              type="button"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-red-500/10">
                <X className="size-3.5" />
              </span>
              <span>退出登录</span>
            </button>
          ) : (
            <Link
              className="flex items-center gap-2.5 rounded-(--mst-radius-lg) px-2.5 py-2 text-[13px] text-(--mst-color-text-primary) transition-colors hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:hover:bg-white/6"
              href="/login"
              onClick={() => {
                setMenuOpen(false)
              }}
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) text-(--mst-color-primary)">
                <User className="size-3.5" />
              </span>
              <span>登录账户</span>
            </Link>
          )}
        </div>
      )}
      trigger={['click']}
    >
      <button
        aria-label={`${isAuthenticated ? userEmail : '访客'} 用户菜单`}
        className="cursor-pointer flex h-11 w-full items-center gap-2 rounded-full border border-slate-900/8 bg-white/82 px-2.5 text-left text-sm text-(--mst-color-text-primary) shadow-(--mst-shadow-sm) backdrop-blur-sm transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:bg-slate-950/72 dark:hover:bg-white/6"
        type="button"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) text-(--mst-color-primary)">
          <User className="size-3.5" />
        </span>
        <span className="truncate">{isAuthenticated ? userEmail : '访客'}</span>
        <ChevronDown
          className={`ml-auto size-4 text-(--mst-color-text-muted) transition-transform ${
            menuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </Dropdown>
  )
}
