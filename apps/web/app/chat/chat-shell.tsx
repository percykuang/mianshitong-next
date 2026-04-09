'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChatMainPane,
  ChatSidebar,
  chatModelOptions,
  createChatSessionTitle,
  createMockAssistantReply,
  formatChatTimestamp,
  sessionPreviews,
  type ChatModelId,
  type ChatSessionPreview,
} from '@/components'

interface ChatShellProps {
  userEmail: string | null
}

export function ChatShell({ userEmail }: ChatShellProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessions, setSessions] = useState(sessionPreviews)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )
  const [selectedModelId, setSelectedModelId] = useState<ChatModelId>(
    chatModelOptions[0].id
  )
  const [draft, setDraft] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const replyTimerRef = useRef<number | null>(null)

  const selectedSession = useMemo(
    () =>
      selectedSessionId
        ? (sessions.find((session) => session.id === selectedSessionId) ?? null)
        : null,
    [selectedSessionId, sessions]
  )

  const hasConversationMessages = Boolean(selectedSession?.messages.length)

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        window.clearTimeout(replyTimerRef.current)
      }
    }
  }, [])

  function handleLogout() {
    void fetch('/api/auth/logout', {
      method: 'POST',
    }).finally(() => {
      router.refresh()
    })
  }

  function handleSelectPrompt(prompt: string) {
    setDraft(prompt)
    composerRef.current?.focus()
  }

  function upsertSessionToTop(
    currentSessions: ChatSessionPreview[],
    session: ChatSessionPreview
  ) {
    return [
      session,
      ...currentSessions.filter((item) => item.id !== session.id),
    ]
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

  function handleSendMessage() {
    const input = draft.trim()

    if (!input || isReplying) {
      return
    }

    const timestamp = formatChatTimestamp()
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      label: '你',
      timestamp,
      content: input,
    }

    const nextSessionId = selectedSessionId ?? `session-${Date.now()}`
    const baseSession =
      sessions.find((session) => session.id === nextSessionId) ?? null
    const nextSession: ChatSessionPreview = {
      id: nextSessionId,
      title: baseSession?.title ?? createChatSessionTitle(input),
      preview: input,
      pinned: baseSession?.pinned,
      messages: [...(baseSession?.messages ?? []), userMessage],
    }

    setDraft('')
    setIsReplying(true)
    setSelectedSessionId(nextSessionId)
    setSessions((currentSessions) =>
      upsertSessionToTop(currentSessions, nextSession)
    )

    replyTimerRef.current = window.setTimeout(() => {
      const assistantMessage = createMockAssistantReply(input)

      setSessions((currentSessions) => {
        const currentSession =
          currentSessions.find((session) => session.id === nextSessionId) ??
          nextSession

        return upsertSessionToTop(currentSessions, {
          ...currentSession,
          preview: assistantMessage.content,
          messages: [...currentSession.messages, assistantMessage],
        })
      })

      setIsReplying(false)
      composerRef.current?.focus()
      replyTimerRef.current = null
    }, 720)
  }

  return (
    <div className="group/sidebar-wrapper relative flex h-dvh w-full overflow-hidden bg-white text-(--mst-color-text-primary) antialiased dark:bg-(--mst-color-bg-page)">
      <style jsx global>{`
        @keyframes chat-shell-fade-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {sidebarOpen ? (
        <button
          aria-label="关闭侧栏"
          className="fixed inset-0 z-30 cursor-pointer bg-slate-950/18 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <ChatSidebar
        onCloseSidebar={() => setSidebarOpen(false)}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
        onNewSession={() => {
          setSelectedSessionId(null)
          setDraft('')
        }}
        onSelectSession={(sessionId) => {
          setSelectedSessionId(sessionId)
        }}
        onTogglePinSession={handleTogglePinSession}
        selectedSessionId={selectedSessionId}
        sessions={sessions}
        sidebarOpen={sidebarOpen}
        userEmail={userEmail}
      />

      <ChatMainPane
        draft={draft}
        hasConversationMessages={hasConversationMessages}
        isReplying={isReplying}
        messages={selectedSession?.messages ?? []}
        onModelChange={setSelectedModelId}
        onDraftChange={setDraft}
        onSelectPrompt={handleSelectPrompt}
        onSubmit={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        selectedModelId={selectedModelId}
        sidebarOpen={sidebarOpen}
        textareaRef={composerRef}
      />
    </div>
  )
}
