'use client'

import { useLayoutEffect, useRef } from 'react'

type FocusableTextElement = HTMLInputElement | HTMLTextAreaElement

/**
 * 在激活时聚焦文本输入元素，并把光标移动到文本末尾。
 *
 * 适合用于“进入编辑态后继续在原内容后输入”这类场景。
 *
 * @param enabled 为 `true` 时触发聚焦与光标定位。
 * @returns 绑定到 input 或 textarea 上的 ref。
 */
export function useFocusAtEnd<
  T extends FocusableTextElement = HTMLTextAreaElement,
>(enabled: boolean) {
  const elementRef = useRef<T | null>(null)

  useLayoutEffect(() => {
    if (!enabled) {
      return
    }

    const element = elementRef.current

    if (!element) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      element.focus({
        preventScroll: true,
      })

      const selectionPosition = element.value.length
      element.setSelectionRange(selectionPosition, selectionPosition)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [enabled])

  return elementRef
}
