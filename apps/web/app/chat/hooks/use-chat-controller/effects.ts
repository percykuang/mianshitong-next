'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

import { type ChatSessionPreview } from '@/app/chat/domain'

import { buildChatPath } from '../../utils'

export function useChatSessionSelectionRouteSyncEffect(input: {
	isReplying: boolean
	pathname: string
	routeSessionId: string | null
	selectedSessionId: string | null
	sessions: ChatSessionPreview[]
	onSelectRouteNewSession: () => void
	onSelectRouteSession: (sessionId: string) => void
}) {
	const {
		isReplying,
		onSelectRouteNewSession,
		onSelectRouteSession,
		pathname,
		routeSessionId,
		selectedSessionId,
		sessions,
	} = input
	const previousPathnameRef = useRef(pathname)
	const handleSelectRouteNewSession = useEffectEvent(() => {
		onSelectRouteNewSession()
	})
	const handleSelectRouteSession = useEffectEvent((sessionId: string) => {
		onSelectRouteSession(sessionId)
	})

	useEffect(() => {
		const pathChanged = previousPathnameRef.current !== pathname
		previousPathnameRef.current = pathname

		if (routeSessionId === selectedSessionId) {
			return
		}

		if (routeSessionId === null) {
			if (!pathChanged || isReplying) {
				return
			}

			handleSelectRouteNewSession()
			return
		}

		if (!sessions.some((session) => session.id === routeSessionId)) {
			handleSelectRouteNewSession()
			return
		}

		handleSelectRouteSession(routeSessionId)
	}, [isReplying, pathname, routeSessionId, selectedSessionId, sessions])
}

export function useChatPathSyncEffect(input: {
	isReplying: boolean
	pathname: string
	selectedSessionId: string | null
	replacePath: (targetPath: string) => void
}) {
	const { isReplying, pathname, replacePath, selectedSessionId } = input
	const handleReplacePath = useEffectEvent((targetPath: string) => {
		replacePath(targetPath)
	})

	useEffect(() => {
		if (isReplying) {
			return
		}

		const targetPath = buildChatPath(selectedSessionId)

		if (targetPath === pathname) {
			return
		}

		handleReplacePath(targetPath)
	}, [isReplying, pathname, selectedSessionId])
}
