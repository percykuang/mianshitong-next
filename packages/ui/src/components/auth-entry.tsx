import Link from 'next/link'
import { cn } from '@mianshitong/shared'
import { Loader, Logout, User } from '@mianshitong/icons'
import { Tooltip } from './tooltip'

export interface AuthEntryClassNames {
  authenticatedContainer?: string
  avatar?: string
  email?: string
  guest?: string
  guestText?: string
  logoutButton?: string
  userIcon?: string
}

export interface AuthEntryProps {
  classNames?: AuthEntryClassNames
  loginHref?: string
  loginLabel?: string
  logoutPending?: boolean
  onLogout?: () => void
  userLabel?: string | null
  variant: 'home' | 'sidebar'
}

const AUTH_ENTRY_STYLES = {
  home: {
    avatarClass:
      'flex size-6 items-center justify-center rounded-full bg-transparent',
    authenticatedContainerClass:
      'inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900/8 bg-transparent pl-2 pr-1 text-xs font-medium text-(--mst-color-text-primary) dark:border-white/10 sm:gap-2 sm:pl-2.5 sm:text-sm',
    emailClass: 'max-w-28 truncate text-left sm:max-w-48',
    guestClass:
      'cursor-pointer inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-900/8 bg-transparent px-6 text-xs font-medium text-(--mst-color-text-primary) transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:hover:bg-white/6 sm:gap-2 sm:px-6 sm:text-sm',
    guestTextClass: 'text-center',
    userIconClass: 'size-4',
    logoutButtonClass:
      'cursor-pointer inline-flex size-7 items-center justify-center rounded-full text-(--mst-color-text-muted) transition-colors duration-200 hover:bg-slate-900/5 hover:text-(--mst-color-primary) disabled:opacity-60 dark:hover:bg-white/6 sm:size-8',
    logoutPlacement: 'bottom' as const,
  },
  sidebar: {
    avatarClass:
      'inline-flex size-7 items-center justify-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-surface) text-(--mst-color-primary)',
    authenticatedContainerClass:
      'flex h-10 w-full items-center gap-2 rounded-full border border-slate-900/8 bg-white/82 px-2.5 text-left text-sm text-(--mst-color-text-primary) shadow-(--mst-shadow-sm) backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/72',
    emailClass: 'min-w-0 flex-1 truncate',
    guestClass:
      'cursor-pointer flex h-10 w-full items-center justify-center rounded-full border border-slate-900/8 bg-white/82 px-2.5 text-center text-sm text-(--mst-color-text-primary) shadow-(--mst-shadow-sm) backdrop-blur-sm transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:bg-slate-950/72 dark:hover:bg-white/6',
    guestTextClass: 'font-semibold',
    userIconClass: 'size-3.5',
    logoutButtonClass:
      'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-(--mst-color-primary) disabled:opacity-60 dark:hover:bg-white/6',
    logoutPlacement: 'top' as const,
  },
} as const

export function AuthEntry({
  classNames,
  loginHref = '/login',
  loginLabel = '登录',
  logoutPending = false,
  onLogout,
  userLabel = null,
  variant,
}: AuthEntryProps) {
  const isAuthenticated = Boolean(userLabel)
  const styles = AUTH_ENTRY_STYLES[variant]
  const logoutLabel = logoutPending ? '退出中...' : '退出登录'
  const logoutButton = (
    <button
      aria-label={logoutLabel}
      className={cn(
        styles.logoutButtonClass,
        classNames?.logoutButton,
        logoutPending &&
          'bg-transparent! text-(--mst-color-text-muted)! hover:bg-transparent! hover:text-(--mst-color-text-muted)! dark:hover:bg-transparent!'
      )}
      disabled={logoutPending || !onLogout}
      onClick={onLogout}
      type="button"
    >
      {logoutPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <Logout className="size-4" />
      )}
    </button>
  )

  if (!isAuthenticated) {
    return (
      <Link
        aria-label={loginLabel}
        className={cn(styles.guestClass, classNames?.guest)}
        href={loginHref}
      >
        <span className={cn(styles.guestTextClass, classNames?.guestText)}>
          {loginLabel}
        </span>
      </Link>
    )
  }

  return (
    <div
      aria-label={userLabel ?? '已登录用户'}
      className={cn(
        styles.authenticatedContainerClass,
        classNames?.authenticatedContainer
      )}
    >
      <span className={cn(styles.avatarClass, classNames?.avatar)}>
        <User className={cn(styles.userIconClass, classNames?.userIcon)} />
      </span>
      <span className={cn(styles.emailClass, classNames?.email)}>
        {userLabel}
      </span>
      {logoutPending ? (
        logoutButton
      ) : (
        <Tooltip
          align={{ offset: [0, 6] }}
          autoAdjustOverflow={false}
          arrow={false}
          placement={styles.logoutPlacement}
          title={logoutLabel}
          variant="surface"
          zIndex={1200}
        >
          {logoutButton}
        </Tooltip>
      )}
    </div>
  )
}
