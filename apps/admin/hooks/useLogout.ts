'use client'

import { useState } from 'react'

import { useAppInstance } from '@mianshitong/ui'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const router = useRouter()
  const { message } = useAppInstance()
  const [pending, setPending] = useState(false)

  async function logout() {
    if (pending) {
      return
    }

    setPending(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null

        throw new Error(payload?.error ?? '退出失败，请稍后重试')
      }

      router.replace('/login')
      router.refresh()
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '退出失败，请稍后重试'
      )
    } finally {
      setPending(false)
    }
  }

  return {
    logout,
    pending,
  }
}
