'use client'

import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import {
  sessionPreviews,
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import {
  appendAssistantDraftToSession,
  createAssistantFallbackMessage,
  createNextSession,
  upsertSessionToTop,
} from './chat-controller.utils'
import { streamChatReply } from './stream-chat-reply'

interface UseChatControllerOptions {
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  initialSelectedModelId: ChatModelId
}

export function useChatController({
  initialRuntimeDebugInfoByModelId,
  initialSelectedModelId,
}: UseChatControllerOptions) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessions, setSessions] = useState(sessionPreviews)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )
  const [selectedModelId, setSelectedModelId] = useState<ChatModelId>(
    initialSelectedModelId
  )
  const [draft, setDraft] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [isAwaitingFirstChunk, setIsAwaitingFirstChunk] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  )
  const [runtimeDebugInfoByModelId, setRuntimeDebugInfoByModelId] = useState<
    Record<ChatModelId, ChatRuntimeDebugInfo>
  >(initialRuntimeDebugInfoByModelId)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const replyAbortControllerRef = useRef<AbortController | null>(null)

  const selectedSession = useMemo(
    () =>
      selectedSessionId
        ? (sessions.find((session) => session.id === selectedSessionId) ?? null)
        : null,
    [selectedSessionId, sessions]
  )

  const hasConversationMessages = Boolean(selectedSession?.messages.length)
  const runtimeDebugInfo = runtimeDebugInfoByModelId[selectedModelId] ?? null

  useEffect(() => {
    return () => {
      replyAbortControllerRef.current?.abort()
    }
  }, [])

  function handleLogout() {
    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      router.refresh()
    })
  }

  function handleNewSession() {
    setSelectedSessionId(null)
    setDraft('')
  }

  function handleSelectSession(sessionId: string) {
    setSelectedSessionId(sessionId)
  }

  async function handleSelectPrompt(prompt: string) {
    if (isReplying) {
      return
    }

    await handleSendMessage(prompt)
  }

  function handleTogglePinSession(sessionId: string) {
    setSessions((currentSessions) => {
      const targetSession = currentSessions.find(
        (session) => session.id === sessionId
      )

      if (!targetSession) {
        return currentSessions
      }

      const nextSession = {
        ...targetSession,
        pinned: !targetSession.pinned,
      }

      if (nextSession.pinned) {
        return upsertSessionToTop(currentSessions, nextSession)
      }

      return currentSessions.map((session) =>
        session.id === sessionId ? nextSession : session
      )
    })
  }

  function handleDeleteSession(sessionId: string) {
    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== sessionId)
    )

    setSelectedSessionId((currentSelectedSessionId) =>
      currentSelectedSessionId === sessionId ? null : currentSelectedSessionId
    )
  }

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
      setSessions((currentSessions) => {
        const currentSession =
          currentSessions.find((session) => session.id === sessionId) ??
          fallbackSession

        return upsertSessionToTop(
          currentSessions,
          appendAssistantDraftToSession({
            content,
            messageId,
            session: currentSession,
          })
        )
      })
    })
  }

  async function handleSendMessage(inputOverride?: string) {
    const input = (inputOverride ?? draft).trim()

    if (!input || isReplying) {
      return
    }

    const nextSession = createNextSession({
      input,
      selectedSessionId,
      sessions,
    })
    const nextSessionId = nextSession.id

    setDraft('')
    setIsReplying(true)
    setIsAwaitingFirstChunk(true)
    setSelectedSessionId(nextSessionId)
    setSessions((currentSessions) =>
      upsertSessionToTop(currentSessions, nextSession)
    )
    requestAnimationFrame(() => {
      composerRef.current?.focus()
    })

    let assistantContent = ''

    try {
      const controller = new AbortController()
      replyAbortControllerRef.current = controller
      const assistantMessageId = `assistant-${Date.now()}`
      setStreamingMessageId(assistantMessageId)

      const { content, runtimeDebugInfo } = await streamChatReply({
        modelId: selectedModelId,
        message: input,
        signal: controller.signal,
        history: nextSession.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        onChunk(nextContent) {
          assistantContent = nextContent
          setIsAwaitingFirstChunk(false)
          updateAssistantDraft(
            nextSessionId,
            nextSession,
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
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      if (assistantContent.trim()) {
        return
      }

      console.error('[chat-shell] send message failed', error)

      const fallbackMessage = createAssistantFallbackMessage()

      setSessions((currentSessions) => {
        const currentSession =
          currentSessions.find((session) => session.id === nextSessionId) ??
          nextSession

        return upsertSessionToTop(currentSessions, {
          ...currentSession,
          preview: fallbackMessage.content,
          messages: [...currentSession.messages, fallbackMessage],
        })
      })
    } finally {
      replyAbortControllerRef.current = null
      setIsAwaitingFirstChunk(false)
      setIsReplying(false)
      setStreamingMessageId(null)
      composerRef.current?.focus()
    }
  }

  return {
    composerRef,
    draft,
    handleDeleteSession,
    handleLogout,
    handleNewSession,
    handleSelectPrompt,
    handleSelectSession,
    handleSendMessage,
    handleStopReply,
    handleTogglePinSession,
    hasConversationMessages,
    isReplying,
    runtimeDebugInfo,
    selectedModelId,
    selectedSession,
    selectedSessionId,
    sessions,
    setDraft,
    setSelectedModelId,
    setSidebarOpen,
    showThinkingIndicator: isReplying && isAwaitingFirstChunk,
    sidebarOpen,
    streamingMessageId,
  }
}
