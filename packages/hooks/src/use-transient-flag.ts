'use client'

import type { RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION_MS = 1500

function clearTimeoutRef(timerRef: RefObject<number | null>) {
  if (timerRef.current) {
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }
}

/**
 * 维护一个会在指定时长后自动重置的短暂布尔状态。
 *
 * 适合用于“已复制”“已下载”“保存成功”这类按钮反馈场景。
 *
 * @param durationMs 状态保持为 `true` 的时长，单位为毫秒。
 * @returns `active` 表示当前反馈态是否激活，`trigger` 用于重新触发该状态。
 */
export function useTransientFlag(durationMs = DEFAULT_DURATION_MS) {
  const [active, setActive] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      clearTimeoutRef(timerRef)
    }
  }, [])

  const trigger = useCallback(() => {
    setActive(true)
    clearTimeoutRef(timerRef)

    timerRef.current = window.setTimeout(() => {
      setActive(false)
      timerRef.current = null
    }, durationMs)
  }, [durationMs])

  return { active, trigger }
}
