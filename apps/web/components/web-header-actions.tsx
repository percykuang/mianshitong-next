'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronDown,
  Dropdown,
  Moon,
  Sun,
  User,
  useThemeMode,
} from '@mianshitong/ui'

export interface WebHeaderActionsProps {
  userEmail?: string | null
  onLogout?: () => void
}

const actionButtonClass =
  'cursor-pointer inline-flex h-11 items-center gap-2 rounded-full border border-slate-900/8 bg-transparent px-2.5 pr-2.5 text-sm font-medium text-(--mst-color-text-primary) transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:hover:bg-white/6'

const iconButtonClass =
  'cursor-pointer inline-flex size-11 items-center justify-center rounded-full border border-transparent bg-transparent text-(--mst-color-text-primary) transition-colors duration-200 hover:bg-slate-900/5 hover:text-(--mst-color-primary) dark:hover:bg-white/6'

const panelClass =
  'w-72 rounded-(--mst-radius-xl) border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) p-2 shadow-(--mst-shadow-lg)'

const panelSectionClass =
  'rounded-(--mst-radius-lg) border border-(--mst-color-border-default) bg-slate-900/4 p-4 dark:bg-white/4'

const secondaryActionClass =
  'inline-flex h-11 w-full items-center justify-center rounded-(--mst-radius-lg) border border-(--mst-color-border-default) bg-transparent px-4 text-sm font-medium text-(--mst-color-text-primary) transition-colors duration-200 hover:border-(--mst-color-primary) hover:text-(--mst-color-primary)'

const primaryActionClass =
  'inline-flex h-11 w-full items-center justify-center rounded-(--mst-radius-lg) bg-(--mst-color-primary) px-4 text-sm font-semibold text-white transition-colors duration-200 hover:brightness-95'

export function WebHeaderActions({
  userEmail = null,
  onLogout,
}: WebHeaderActionsProps) {
  const { toggleThemeMode } = useThemeMode()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAuthenticated = Boolean(userEmail)

  const userButton = (
    <button
      aria-label={userEmail ?? '游客'}
      className={actionButtonClass}
      type="button"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-transparent">
        <User className="size-4" />
      </span>
      <span className="max-w-48 truncate text-left">{userEmail ?? '游客'}</span>
      <ChevronDown
        className={`size-4 text-(--mst-color-text-muted) transition-transform duration-200 ${
          menuOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-1 md:gap-2">
      <Dropdown
        destroyOnHidden
        menu={{ items: [] }}
        onOpenChange={setMenuOpen}
        open={menuOpen}
        overlayClassName="mst-account-dropdown"
        placement="bottomRight"
        popupRender={() =>
          isAuthenticated ? (
            <div className={panelClass}>
              <div className={panelSectionClass}>
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) text-(--mst-color-primary) shadow-(--mst-shadow-sm)">
                    <User className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-[0.18em] text-(--mst-color-text-muted) uppercase">
                      Account
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-(--mst-color-text-primary)">
                      {userEmail}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-(--mst-color-text-secondary)">
                      当前已登录，可继续使用面试记录与偏好设置。
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className={secondaryActionClass}
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout?.()
                  }}
                  type="button"
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
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
          )
        }
        trigger={['click']}
      >
        {userButton}
      </Dropdown>

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
