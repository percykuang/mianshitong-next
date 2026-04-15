'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { isFetchTypeError } from '@mianshitong/shared'
import {
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import {
  appendAssistantDraftToSession,
  createAssistantFallbackMessage,
  persistInterruptedChatReply,
  streamChatReply,
  streamEditedChatReply,
} from '../../utils'
import {
  appendFallbackMessageToSessions,
  finalizeAssistantMessageInSessions,
  hydratePersistedSession,
  replaceSession,
  updateAssistantDraftInSessions,
} from './session-updates'
import { hydrateReplySession, prepareReplySession } from './session-persistence'
import { type UseChatReplyStateOptions } from './types'

interface ActiveReplySnapshot {
  assistantContent: string
  assistantMessageId: string | null
  fallbackSession: ChatSessionPreview | null
  optimisticSessionId: string | null
  sessionId: string | null
}

export function useChatReplyState({
  initialRuntimeDebugInfoByModelId,
  initialSelectedModelId,
  persistenceEnabled,
  selectedSessionId,
  sessions,
  setSelectedSessionId,
  setSessions,
}: UseChatReplyStateOptions) {
  const [draft, setDraft] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [isAwaitingFirstChunk, setIsAwaitingFirstChunk] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  )
  const [selectedModelId, setSelectedModelId] = useState<ChatModelId>(
    initialSelectedModelId
  )
  const [runtimeDebugInfoByModelId, setRuntimeDebugInfoByModelId] = useState<
    Record<ChatModelId, ChatRuntimeDebugInfo>
  >(initialRuntimeDebugInfoByModelId)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const replyAbortControllerRef = useRef<AbortController | null>(null)
  const activeReplySnapshotRef = useRef<ActiveReplySnapshot>({
    assistantContent: '',
    assistantMessageId: null,
    fallbackSession: null,
    optimisticSessionId: null,
    sessionId: null,
  })

  useEffect(() => {
    return () => {
      replyAbortControllerRef.current?.abort()
    }
  }, [])

  function resetActiveReplySnapshot() {
    activeReplySnapshotRef.current = {
      assistantContent: '',
      assistantMessageId: null,
      fallbackSession: null,
      optimisticSessionId: null,
      sessionId: null,
    }
  }

  function handleStopReply() {
    const activeReplySnapshot = activeReplySnapshotRef.current

    replyAbortControllerRef.current?.abort()
    replyAbortControllerRef.current = null

    if (
      activeReplySnapshot.assistantMessageId &&
      activeReplySnapshot.assistantContent.trim() &&
      activeReplySnapshot.sessionId &&
      activeReplySnapshot.fallbackSession
    ) {
      finalizeInterruptedAssistantLocally({
        assistantMessageId: activeReplySnapshot.assistantMessageId,
        fallbackSession: activeReplySnapshot.fallbackSession,
        sessionId: activeReplySnapshot.sessionId,
      })
    }

    setIsAwaitingFirstChunk(false)
    setIsReplying(false)
    setStreamingMessageId(null)
    composerRef.current?.focus()
  }

  function updateAssistantDraft(
    sessionId: string,
    fallbackSession: ChatSessionPreview,
    messageId: string,
    content: string
  ) {
    startTransition(() => {
      setSessions((currentSessions) =>
        updateAssistantDraftInSessions(currentSessions, {
          content,
          fallbackSession,
          messageId,
          sessionId,
        })
      )
    })
  }

  async function hydrateEditedSession(sessionId: string) {
    await hydrateReplySession({
      optimisticSessionId: sessionId,
      persistenceEnabled,
      sessionId,
      setSelectedSessionId,
      setSessions,
    })
  }

  function syncPersistedSession(
    optimisticSessionId: string,
    persistedSession: ChatSessionPreview
  ) {
    startTransition(() => {
      setSelectedSessionId(persistedSession.id)
      setSessions((currentSessions) =>
        hydratePersistedSession(
          currentSessions,
          optimisticSessionId,
          persistedSession
        )
      )
    })
  }

  function finalizeInterruptedAssistantLocally(input: {
    assistantMessageId: string
    fallbackSession: ChatSessionPreview
    sessionId: string
  }) {
    startTransition(() => {
      setSessions((currentSessions) =>
        finalizeAssistantMessageInSessions(currentSessions, {
          completionStatus: 'interrupted',
          fallbackSession: input.fallbackSession,
          messageId: input.assistantMessageId,
          sessionId: input.sessionId,
        })
      )
    })
  }

  async function handleSendMessage(inputOverride?: string) {
    const input = (inputOverride ?? draft).trim()

    if (!input || isReplying) {
      return
    }

    setDraft('')
    setIsReplying(true)
    setIsAwaitingFirstChunk(true)

    requestAnimationFrame(() => {
      composerRef.current?.focus()
    })

    let assistantContent = ''
    let assistantMessageId: string | null = null
    let optimisticSession: ChatSessionPreview | null = null
    let optimisticSessionId: string | null = null
    let nextSessionId: string | null = null
    let nextSession: ChatSessionPreview | null = null

    try {
      resetActiveReplySnapshot()

      const preparedSession = await prepareReplySession({
        input,
        persistenceEnabled,
        selectedModelId,
        selectedSessionId,
        sessions,
        setSelectedSessionId,
        setSessions,
      })

      optimisticSession = preparedSession.optimisticSession
      optimisticSessionId = preparedSession.optimisticSessionId
      nextSessionId = preparedSession.activeSessionId
      nextSession = preparedSession.activeSession
      activeReplySnapshotRef.current = {
        assistantContent: '',
        assistantMessageId: null,
        fallbackSession: nextSession ?? optimisticSession,
        optimisticSessionId,
        sessionId: nextSessionId,
      }

      const controller = new AbortController()
      replyAbortControllerRef.current = controller
      const nextAssistantMessageId = `assistant-${Date.now()}`
      assistantMessageId = nextAssistantMessageId
      setStreamingMessageId(nextAssistantMessageId)

      const {
        content,
        runtimeDebugInfo,
        sessionId: persistedSessionId,
      } = await streamChatReply({
        modelId: selectedModelId,
        message: input,
        sessionId: persistenceEnabled
          ? (nextSessionId ?? undefined)
          : undefined,
        signal: controller.signal,
        history: (nextSession?.messages ?? []).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        onChunk(nextContent) {
          assistantContent = nextContent
          setIsAwaitingFirstChunk(false)

          const draftSession = nextSession ?? optimisticSession

          if (!nextSessionId || !draftSession) {
            return
          }

          activeReplySnapshotRef.current = {
            assistantContent: nextContent,
            assistantMessageId: nextAssistantMessageId,
            fallbackSession: appendAssistantDraftToSession({
              content: nextContent,
              messageId: nextAssistantMessageId,
              session: draftSession,
            }),
            optimisticSessionId,
            sessionId: nextSessionId,
          }

          updateAssistantDraft(
            nextSessionId,
            draftSession,
            nextAssistantMessageId,
            nextContent
          )
        },
      })

      setRuntimeDebugInfoByModelId((current) => ({
        ...current,
        [runtimeDebugInfo.requestedModelId]: runtimeDebugInfo,
      }))
      assistantContent = content
      activeReplySnapshotRef.current = {
        ...activeReplySnapshotRef.current,
        assistantContent: content,
      }

      if (!optimisticSessionId) {
        return
      }

      await hydrateReplySession({
        optimisticSessionId,
        persistenceEnabled,
        sessionId: persistedSessionId ?? nextSessionId,
        setSelectedSessionId,
        setSessions,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        const activeReplySnapshot = activeReplySnapshotRef.current
        const interruptedContent =
          activeReplySnapshot.assistantContent.trim() || assistantContent.trim()
        const draftSession =
          activeReplySnapshot.fallbackSession ??
          nextSession ??
          optimisticSession
        const interruptedSessionId =
          activeReplySnapshot.sessionId ?? nextSessionId
        const interruptedAssistantMessageId =
          activeReplySnapshot.assistantMessageId ?? assistantMessageId

        if (
          !interruptedAssistantMessageId ||
          !interruptedContent ||
          !interruptedSessionId ||
          !draftSession
        ) {
          return
        }

        finalizeInterruptedAssistantLocally({
          assistantMessageId: interruptedAssistantMessageId,
          fallbackSession: draftSession,
          sessionId: interruptedSessionId,
        })

        if (persistenceEnabled) {
          try {
            const persistedSession = await persistInterruptedChatReply({
              content: interruptedContent,
              expectedMessageCount: draftSession.messages.length,
              sessionId: interruptedSessionId,
            })

            syncPersistedSession(
              activeReplySnapshot.optimisticSessionId ??
                optimisticSessionId ??
                persistedSession.id,
              persistedSession
            )
          } catch (persistError) {
            console.warn(
              '[chat-shell] persist interrupted reply failed',
              persistError
            )
          }
        }

        return
      }

      if (assistantContent.trim()) {
        return
      }

      if (isFetchTypeError(error)) {
        console.warn(
          '[chat-shell] send message fetch failed, fallback message rendered'
        )
      } else {
        console.error('[chat-shell] send message failed', error)
      }

      const fallbackMessage = createAssistantFallbackMessage()

      if (!nextSessionId || !nextSession) {
        return
      }

      const fallbackSession = nextSession
      const fallbackSessionId = nextSessionId

      setSessions((currentSessions) =>
        appendFallbackMessageToSessions(currentSessions, {
          fallbackMessage,
          fallbackSession,
          sessionId: fallbackSessionId,
        })
      )
    } finally {
      replyAbortControllerRef.current = null
      resetActiveReplySnapshot()
      setIsAwaitingFirstChunk(false)
      setIsReplying(false)
      setStreamingMessageId(null)
      composerRef.current?.focus()
    }
  }

  async function handleSelectPrompt(prompt: string) {
    if (isReplying) {
      return
    }

    await handleSendMessage(prompt)
  }

  async function handleEditMessage(input: {
    assistantMessageId: string
    messageId: string
    nextContent: string
    onOptimisticSessionApplied: () => void
    optimisticSession: ChatSessionPreview
    originalSession: ChatSessionPreview
    sessionId: string
  }) {
    if (isReplying) {
      return false
    }

    setIsReplying(true)
    setIsAwaitingFirstChunk(true)

    let assistantContent = ''

    try {
      resetActiveReplySnapshot()

      startTransition(() => {
        setSessions((currentSessions) =>
          replaceSession(
            currentSessions,
            input.sessionId,
            input.optimisticSession
          )
        )
        input.onOptimisticSessionApplied()
      })
      activeReplySnapshotRef.current = {
        assistantContent: '',
        assistantMessageId: input.assistantMessageId,
        fallbackSession: input.optimisticSession,
        optimisticSessionId: input.sessionId,
        sessionId: input.sessionId,
      }

      const controller = new AbortController()
      replyAbortControllerRef.current = controller
      setStreamingMessageId(input.assistantMessageId)

      const {
        content,
        runtimeDebugInfo,
        sessionId: persistedSessionId,
      } = await streamEditedChatReply({
        content: input.nextContent,
        messageId: input.messageId,
        sessionId: input.sessionId,
        signal: controller.signal,
        onChunk(nextContent) {
          assistantContent = nextContent
          setIsAwaitingFirstChunk(false)

          activeReplySnapshotRef.current = {
            assistantContent: nextContent,
            assistantMessageId: input.assistantMessageId,
            fallbackSession: appendAssistantDraftToSession({
              content: nextContent,
              messageId: input.assistantMessageId,
              session: input.optimisticSession,
            }),
            optimisticSessionId: input.sessionId,
            sessionId: input.sessionId,
          }

          updateAssistantDraft(
            input.sessionId,
            input.optimisticSession,
            input.assistantMessageId,
            nextContent
          )
        },
      })

      setRuntimeDebugInfoByModelId((current) => ({
        ...current,
        [runtimeDebugInfo.requestedModelId]: runtimeDebugInfo,
      }))
      assistantContent = content
      activeReplySnapshotRef.current = {
        ...activeReplySnapshotRef.current,
        assistantContent: content,
      }

      await hydrateReplySession({
        optimisticSessionId: input.sessionId,
        persistenceEnabled,
        sessionId: persistedSessionId ?? input.sessionId,
        setSelectedSessionId,
        setSessions,
      })

      return true
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('[chat-shell] edit message failed', error)
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        const activeReplySnapshot = activeReplySnapshotRef.current
        const interruptedContent =
          activeReplySnapshot.assistantContent.trim() || assistantContent.trim()

        if (!interruptedContent) {
          try {
            await hydrateEditedSession(input.sessionId)
          } catch (hydrateError) {
            console.warn(
              '[chat-shell] hydrate edited session failed after abort',
              hydrateError
            )
          }

          return false
        }

        finalizeInterruptedAssistantLocally({
          assistantMessageId:
            activeReplySnapshot.assistantMessageId ?? input.assistantMessageId,
          fallbackSession:
            activeReplySnapshot.fallbackSession ?? input.optimisticSession,
          sessionId: activeReplySnapshot.sessionId ?? input.sessionId,
        })

        if (persistenceEnabled) {
          try {
            const persistedSession = await persistInterruptedChatReply({
              content: interruptedContent,
              expectedMessageCount: (
                activeReplySnapshot.fallbackSession ?? input.optimisticSession
              ).messages.length,
              sessionId: activeReplySnapshot.sessionId ?? input.sessionId,
            })

            syncPersistedSession(input.sessionId, persistedSession)
          } catch (persistError) {
            console.warn(
              '[chat-shell] persist interrupted edited reply failed',
              persistError
            )
          }
        }

        return false
      }

      try {
        await hydrateEditedSession(input.sessionId)
      } catch (hydrateError) {
        console.warn('[chat-shell] hydrate edited session failed', hydrateError)

        startTransition(() => {
          setSessions((currentSessions) =>
            replaceSession(
              currentSessions,
              input.sessionId,
              input.originalSession
            )
          )
        })
      }

      return false
    } finally {
      replyAbortControllerRef.current = null
      resetActiveReplySnapshot()
      setIsAwaitingFirstChunk(false)
      setIsReplying(false)
      setStreamingMessageId(null)
    }
  }

  return {
    composerRef,
    draft,
    handleEditMessage,
    handleSelectPrompt,
    handleSendMessage,
    handleStopReply,
    isReplying,
    runtimeDebugInfo: runtimeDebugInfoByModelId[selectedModelId] ?? null,
    selectedModelId,
    setDraft,
    setSelectedModelId,
    showThinkingIndicator: isReplying && isAwaitingFirstChunk,
    streamingMessageId,
  }
}
