'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ChatUsageSummary } from '@/app/chat/domain'

async function fetchChatUsage() {
  const response = await fetch('/api/chat/usage', {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as ChatUsageSummary
}

export function useChatUsage() {
  const [usage, setUsage] = useState<ChatUsageSummary | null>(null)
  const [usageError, setUsageError] = useState(false)
  const [usageLoading, setUsageLoading] = useState(true)

  const refreshUsage = useCallback(async () => {
    setUsageLoading(true)

    try {
      const nextUsage = await fetchChatUsage()
      setUsageError(nextUsage === null)
      setUsage(nextUsage)
      return nextUsage
    } catch {
      setUsageError(true)
      setUsage(null)
      return null
    } finally {
      setUsageLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUsage()
  }, [refreshUsage])

  return {
    usageError,
    refreshUsage,
    usage,
    usageLoading,
  }
}
