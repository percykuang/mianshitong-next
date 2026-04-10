'use client'

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  type ChatModelId,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import {
  appendAssistantDraftToSession,
  createAssistantFallbackMessage,
} from '../utils/chat-message.utils'
import { createNextSession, sortSessions } from '../utils/chat-session.utils'
import { streamChatReply } from '../utils/stream-chat-reply'

interface UseChatReplyStateOptions {
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  initialSelectedModelId: ChatModelId
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  setSelectedSessionId: Dispatch<SetStateAction<string | null>>
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export function useChatReplyState({
  initialRuntimeDebugInfoByModelId,
  initialSelectedModelId,
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
      setSessions((currentSessions) => {
        const currentSession =
          currentSessions.find((session) => session.id === sessionId) ??
          fallbackSession

        return sortSessions(
          currentSessions.map((session) =>
            session.id === sessionId
              ? appendAssistantDraftToSession({
                  content,
                  messageId,
                  session: currentSession,
                })
              : session
          )
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
      sortSessions(
        currentSessions.some((session) => session.id === nextSession.id)
          ? currentSessions.map((session) =>
              session.id === nextSession.id ? nextSession : session
            )
          : [...currentSessions, nextSession]
      )
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

        return sortSessions(
          currentSessions.map((session) =>
            session.id === nextSessionId
              ? {
                  ...currentSession,
                  preview: fallbackMessage.content,
                  messages: [...currentSession.messages, fallbackMessage],
                }
              : session
          )
        )
      })
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
