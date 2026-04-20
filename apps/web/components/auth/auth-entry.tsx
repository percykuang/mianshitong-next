'use client'

import { App } from 'antd'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  AuthEntry as AuthEntryView,
  type AuthEntryProps as AuthEntryViewProps,
} from '@mianshitong/ui'
import { createAuthPageHref } from '@/utils/auth'
import { logoutCurrentUser } from '@/utils/logout'

export interface AuthEntryProps {
  userEmail?: string | null
  variant: 'home' | 'sidebar'
}

export function AuthEntry({ userEmail = null, variant }: AuthEntryProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { message } = App.useApp()
  const [logoutPending, setLogoutPending] = useState(false)

  const queryString = searchParams.toString()
  const currentPath = pathname
    ? `${pathname}${queryString ? `?${queryString}` : ''}`
    : null

  function handleLogout() {
    if (logoutPending) {
      return
    }

    setLogoutPending(true)

    void (async function runLogout() {
      try {
        await logoutCurrentUser()
        window.location.reload()
      } catch (error: unknown) {
        message.error(
          error instanceof Error ? error.message : '退出失败，请稍后重试'
        )
      } finally {
        setLogoutPending(false)
      }
    })()
  }

  const viewProps: AuthEntryViewProps = {
    loginHref: createAuthPageHref('/login', currentPath),
    logoutPending,
    onLogout: handleLogout,
    userLabel: userEmail,
    variant,
  }

  return <AuthEntryView {...viewProps} />
}
