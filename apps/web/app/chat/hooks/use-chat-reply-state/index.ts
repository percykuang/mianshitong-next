'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import {
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import { createAssistantFallbackMessage, streamChatReply } from '../../utils'
import {
  appendFallbackMessageToSessions,
  updateAssistantDraftInSessions,
} from './session-updates'
import { hydrateReplySession, prepareReplySession } from './session-persistence'
import { type UseChatReplyStateOptions } from './types'

function isFetchTypeError(error: unknown) {
  return (
    error instanceof TypeError &&
    typeof error.message === 'string' &&
    /fetch/i.test(error.message)
  )
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

  useEffect(() => {
    return () => {
      replyAbortControllerRef.current?.abort()
    }
  }, [])

  function handleStopReply() {
    replyAbortControllerRef.current?.abort()
    replyAbortControllerRef.current = null
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
    let optimisticSession: ChatSessionPreview | null = null
    let optimisticSessionId: string | null = null
    let nextSessionId: string | null = null
    let nextSession: ChatSessionPreview | null = null

    try {
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

      const controller = new AbortController()
      replyAbortControllerRef.current = controller
      const assistantMessageId = `assistant-${Date.now()}`
      setStreamingMessageId(assistantMessageId)

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

          updateAssistantDraft(
            nextSessionId,
            draftSession,
            assistantMessageId,
            nextContent
          )
        },
      })

      setRuntimeDebugInfoByModelId((current) => ({
        ...current,
        [selectedModelId]: runtimeDebugInfo,
      }))
      assistantContent = content

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

  return {
    composerRef,
    draft,
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
