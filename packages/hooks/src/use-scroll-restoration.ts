'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

const scrollTopByKey = new Map<string, number>()

/**
 * 记住并恢复某个滚动容器的垂直滚动位置。
 *
 * 适合用于会因为路由切换、条件渲染或组件重挂载而丢失滚动位置的列表容器。
 * 相同的 `key` 会共享一份滚动位置缓存。
 *
 * @param key 用于区分滚动位置缓存的稳定标识。
 * @returns 绑定到滚动容器上的 ref。
 */
export function useScrollRestoration<T extends HTMLElement = HTMLDivElement>(
	key: string
) {
	const scrollContainerRef = useRef<T | null>(null)

	useLayoutEffect(() => {
		const container = scrollContainerRef.current

		if (!container) {
			return
		}

		container.scrollTop = scrollTopByKey.get(key) ?? 0
	}, [key])

	useEffect(() => {
		const container = scrollContainerRef.current

		if (!container) {
			return
		}

		const scrollContainer = container

		const handleScroll = () => {
			scrollTopByKey.set(key, scrollContainer.scrollTop)
		}

		handleScroll()
		scrollContainer.addEventListener('scroll', handleScroll, {
			passive: true,
		})

		return () => {
			scrollTopByKey.set(key, scrollContainer.scrollTop)
			scrollContainer.removeEventListener('scroll', handleScroll)
		}
	}, [key])

	return scrollContainerRef
}
