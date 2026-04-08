'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export interface WebHeaderActionsProps {
  userEmail?: string | null
  onLogout?: () => void
}

const actionButtonClass =
  'cursor-pointer inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900/8 bg-transparent px-2 pr-1.5 text-xs font-medium text-(--mst-color-text-primary) transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:hover:bg-white/6 sm:h-11 sm:gap-2 sm:px-2.5 sm:pr-2.5 sm:text-sm'

const authenticatedActionClass =
  'inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900/8 bg-transparent pl-2 pr-1 text-xs font-medium text-(--mst-color-text-primary) dark:border-white/10 sm:h-11 sm:gap-2 sm:pl-2.5 sm:text-sm'

const iconButtonClass =
  'cursor-pointer inline-flex size-10 items-center justify-center rounded-full border border-transparent bg-transparent text-(--mst-color-text-primary) transition-colors duration-200 hover:bg-slate-900/5 hover:text-(--mst-color-primary) dark:hover:bg-white/6 sm:size-11'

const clearButtonClass =
  'inline-flex size-7 items-center justify-center rounded-full text-(--mst-color-text-muted) transition-colors duration-200 hover:bg-slate-900/5 hover:text-(--mst-color-primary) disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-white/6 sm:size-8'

const panelClass =
  'w-72 rounded-(--mst-radius-xl) border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) p-2 shadow-(--mst-shadow-lg)'

const panelSectionClass =
  'rounded-(--mst-radius-lg) border border-(--mst-color-border-default) bg-slate-900/4 p-4 dark:bg-white/4'

const primaryActionClass =
  'inline-flex h-11 w-full items-center justify-center rounded-(--mst-radius-lg) bg-(--mst-color-primary) px-4 text-sm font-semibold text-white transition-colors duration-200 hover:brightness-95'

export function WebHeaderActions({
  userEmail = null,
  onLogout,
}: WebHeaderActionsProps) {
  const router = useRouter()
  const { toggleThemeMode } = useThemeMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutPending, setLogoutPending] = useState(false)
  const isAuthenticated = Boolean(userEmail)

  function handleLogout() {
    setMenuOpen(false)
    setLogoutPending(true)

    void (
      onLogout
        ? Promise.resolve(onLogout())
        : fetch('/api/auth/logout', {
            method: 'POST',
          })
    ).finally(() => {
      setLogoutPending(false)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {isAuthenticated ? (
        <div
          aria-label={userEmail ?? '已登录用户'}
          className={authenticatedActionClass}
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-transparent">
            <User className="size-4" />
          </span>
          <span className="max-w-28 truncate text-left sm:max-w-48">
            {userEmail}
          </span>
          <button
            aria-label="退出登录"
            className={clearButtonClass}
            disabled={logoutPending}
            onClick={handleLogout}
            type="button"
          >
            <X className="size-4 cursor-pointer" />
          </button>
        </div>
      ) : (
        <Dropdown
          destroyOnHidden
          menu={{ items: [] }}
          onOpenChange={setMenuOpen}
          open={menuOpen}
          overlayClassName="mst-account-dropdown"
          placement="bottomRight"
          popupRender={() => (
            <div className={panelClass}>
              <div className={panelSectionClass}>
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) text-(--mst-color-primary) shadow-(--mst-shadow-sm)">
                    <User className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-(--mst-color-text-primary)">
                      游客模式
                    </p>
                    <p className="mt-1 text-xs leading-5 text-(--mst-color-text-secondary)">
                      登录后可保存面试记录、同步偏好设置，并继续你的练习进度。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  className={primaryActionClass}
                  href="/login"
                  onClick={() => {
                    setMenuOpen(false)
                  }}
                >
                  登录
                </Link>
              </div>
            </div>
          )}
          trigger={['click']}
        >
          <button aria-label="游客" className={actionButtonClass} type="button">
            <span className="flex size-6 items-center justify-center rounded-full bg-transparent">
              <User className="size-4" />
            </span>
            <span className="max-w-16 truncate text-left sm:max-w-48">
              游客
            </span>
            <ChevronDown
              className={`size-4 text-(--mst-color-text-muted) transition-transform duration-200 ${
                menuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </Dropdown>
      )}

      <button
        aria-label="切换主题"
        className={iconButtonClass}
        onClick={toggleThemeMode}
        type="button"
      >
        <Sun className="hidden size-5 dark:block" />
        <Moon className="block size-5 dark:hidden" />
      </button>
    </div>
  )
}
