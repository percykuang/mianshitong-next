'use client'

import { isFetchTypeError } from '@mianshitong/shared'

import { type ChatRuntimeDebugInfo } from '@/app/chat/domain'

import {
	buildPersistedReplySessionFailureState,
	buildPersistedReplySessionState,
	createFallbackReplySession,
	getPersistedChatSession,
	persistInterruptedChatReply,
} from '../../utils'
import {
	commitActiveReplyToSession,
	getSessionById,
	replaceSession,
} from '../core/helpers'
import {
	type ActiveReply,
	type ChatStoreGetState,
	type ChatStoreSetState,
} from '../core/types'

export interface ChatReplyLifecycle {
	clearActiveReply: (assistantMessageId: string) => void
	finalizeCompletedReply: (input: {
		activeReply: ActiveReply
		assistantMessageId: string
	}) => void
	finalizeFailedReply: (input: {
		activeReply: ActiveReply
		assistantMessageId: string
		error: unknown
	}) => Promise<void>
	finalizeInterruptedReply: (input: {
		activeReply: ActiveReply
		assistantMessageId: string
	}) => Promise<void>
	hydrateSession: (
		sessionId: string,
		optimisticSessionId: string
	) => Promise<void>
	syncReplyChunk: (assistantMessageId: string, latestContent: string) => void
	syncReplyResult: (input: {
		assistantMessageId: string
		content: string
		runtimeDebugInfo: ChatRuntimeDebugInfo
	}) => void
}

interface CreateChatReplyLifecycleInput {
	get: ChatStoreGetState
	set: ChatStoreSetState
}

export function createChatReplyLifecycle({
	get,
	set,
}: CreateChatReplyLifecycleInput): ChatReplyLifecycle {
	const hydrateSession = async (
		sessionId: string,
		optimisticSessionId: string
	) => {
		try {
			const persistedSession = await getPersistedChatSession(sessionId)

			set((state) =>
				buildPersistedReplySessionState({
					optimisticSessionId,
					pendingSidebarSessionId: state.pendingSidebarSessionId,
					persistedSession,
					sessions: state.sessions,
				})
			)
		} catch (error) {
			console.warn('[chat-store] hydrate persisted session failed', error)
			set((state) =>
				buildPersistedReplySessionFailureState({
					optimisticSessionId,
					pendingSidebarSessionId: state.pendingSidebarSessionId,
					sessionId,
				})
			)
		}
	}

	const clearActiveReply = (assistantMessageId: string) => {
		set((state) =>
			state.activeReply?.assistantMessageId === assistantMessageId
				? { activeReply: null }
				: state
		)
	}

	const syncReplyChunk = (
		assistantMessageId: string,
		latestContent: string
	) => {
		set((state) =>
			state.activeReply?.assistantMessageId === assistantMessageId
				? {
						activeReply: {
							...state.activeReply,
							latestContent,
							status: 'streaming',
						},
					}
				: state
		)
	}

	const syncReplyResult = (input: {
		assistantMessageId: string
		content: string
		runtimeDebugInfo: ChatRuntimeDebugInfo
	}) => {
		set((state) => ({
			activeReply:
				state.activeReply?.assistantMessageId === input.assistantMessageId
					? {
							...state.activeReply,
							latestContent: input.content,
							status: 'streaming',
						}
					: state.activeReply,
			runtimeDebugInfoByModelId: {
				...state.runtimeDebugInfoByModelId,
				[input.runtimeDebugInfo.requestedModelId]: input.runtimeDebugInfo,
			},
		}))
	}

	const finalizeInterruptedReply = async (input: {
		activeReply: ActiveReply
		assistantMessageId: string
	}) => {
		const currentState = get()
		const currentSession = getSessionById(
			currentState.sessions,
			input.activeReply.sessionId
		)

		if (!currentSession || !input.activeReply.latestContent.trim()) {
			return
		}

		const interruptedSession = commitActiveReplyToSession({
			activeReply: input.activeReply,
			completionStatus: 'interrupted',
			session: currentSession,
		})

		set((state) => {
			const nextState = {
				sessions: replaceSession(
					state.sessions,
					interruptedSession.id,
					interruptedSession
				),
			}

			return nextState
		})

		if (!currentState.persistenceEnabled) {
			clearActiveReply(input.assistantMessageId)
			return
		}

		try {
			const persistedSession = await persistInterruptedChatReply({
				content: input.activeReply.latestContent.trim(),
				expectedMessageCount: currentSession.messages.length,
				sessionId: interruptedSession.id,
			})

			set((state) => ({
				activeReply:
					state.activeReply?.assistantMessageId === input.assistantMessageId
						? null
						: state.activeReply,
				...buildPersistedReplySessionState({
					optimisticSessionId:
						input.activeReply.optimisticSessionId ?? persistedSession.id,
					pendingSidebarSessionId: state.pendingSidebarSessionId,
					persistedSession,
					sessions: state.sessions,
				}),
			}))
		} catch (error) {
			console.warn('[chat-store] persist interrupted reply failed', error)
			await hydrateSession(
				interruptedSession.id,
				input.activeReply.optimisticSessionId ?? interruptedSession.id
			)
			clearActiveReply(input.assistantMessageId)
		}
	}

	const finalizeFailedReply = async (input: {
		activeReply: ActiveReply
		assistantMessageId: string
		error: unknown
	}) => {
		if (input.activeReply.latestContent.trim()) {
			await finalizeInterruptedReply(input)
			return
		}

		if (input.activeReply.mode === 'edit') {
			if (get().persistenceEnabled) {
				await hydrateSession(
					input.activeReply.sessionId,
					input.activeReply.optimisticSessionId ?? input.activeReply.sessionId
				)
			}

			return
		}

		const currentState = get()
		const currentSession = getSessionById(
			currentState.sessions,
			input.activeReply.sessionId
		)

		if (!currentSession) {
			return
		}

		if (isFetchTypeError(input.error)) {
			console.warn(
				'[chat-store] send message fetch failed, fallback message rendered'
			)
		} else {
			console.error('[chat-store] send message failed', input.error)
		}

		const fallbackSession = createFallbackReplySession(currentSession)

		set((state) => ({
			activeReply:
				state.activeReply?.assistantMessageId === input.assistantMessageId
					? null
					: state.activeReply,
			sessions: replaceSession(
				state.sessions,
				fallbackSession.id,
				fallbackSession
			),
		}))
	}

	const finalizeCompletedReply = (input: {
		activeReply: ActiveReply
		assistantMessageId: string
	}) => {
		const currentState = get()
		const currentSession = getSessionById(
			currentState.sessions,
			input.activeReply.sessionId
		)

		if (!currentSession || !input.activeReply.latestContent.trim()) {
			return
		}

		const completedSession = commitActiveReplyToSession({
			activeReply: input.activeReply,
			completionStatus: 'completed',
			session: currentSession,
		})

		set((state) => {
			const nextState = {
				sessions: replaceSession(
					state.sessions,
					completedSession.id,
					completedSession
				),
			}

			return state.activeReply?.assistantMessageId === input.assistantMessageId
				? {
						...nextState,
						activeReply: null,
					}
				: nextState
		})
	}

	return {
		clearActiveReply,
		finalizeCompletedReply,
		finalizeFailedReply,
		finalizeInterruptedReply,
		hydrateSession,
		syncReplyChunk,
		syncReplyResult,
	}
}
