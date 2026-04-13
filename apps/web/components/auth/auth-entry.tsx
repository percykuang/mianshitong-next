'use client'

import { App } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  AuthEntry as AuthEntryView,
  type AuthEntryProps as AuthEntryViewProps,
} from '@mianshitong/ui'
import { logoutCurrentUser } from '@/utils/logout'

export interface AuthEntryProps {
  userEmail?: string | null
  variant: 'home' | 'sidebar'
}

export function AuthEntry({ userEmail = null, variant }: AuthEntryProps) {
  const router = useRouter()
  const { message } = App.useApp()
  const [logoutPending, setLogoutPending] = useState(false)

  function handleLogout() {
    if (logoutPending) {
      return
    }

    setLogoutPending(true)

    void logoutCurrentUser()
      .then(() => {
        router.refresh()
      })
      .catch((error: unknown) => {
        message.error(
          error instanceof Error ? error.message : '退出失败，请稍后重试'
        )
      })
      .finally(() => {
        setLogoutPending(false)
      })
  }

  const viewProps: AuthEntryViewProps = {
    loginHref: '/login',
    logoutPending,
    onLogout: handleLogout,
    userLabel: userEmail,
    variant,
  }

  return <AuthEntryView {...viewProps} />
}
