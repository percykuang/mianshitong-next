'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { ChevronLeft, Menu } from '@mianshitong/ui'
import { type ConversationMessage } from './chat-data'
import { ChatComposer } from './chat-composer'
import { ChatEmptyState } from './chat-empty-state'
import { ChatMessageCard } from './chat-message-card'

export function ChatMainPane({
  draft,
  hasConversationMessages,
  isReplying,
  messages,
  onDraftChange,
  onSelectPrompt,
  onSubmit,
  onToggleSidebar,
  sidebarOpen,
  textareaRef,
}: {
  draft: string
  hasConversationMessages: boolean
  isReplying: boolean
  messages: ConversationMessage[]
  onDraftChange: (value: string) => void
  onSelectPrompt: (prompt: string) => void
  onSubmit: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const showEmptyState = !hasConversationMessages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    })
  }, [isReplying, messages])

  return (
    <main
      className={`relative flex h-dvh min-h-0 w-full flex-1 flex-col overflow-hidden bg-white transition-[margin] duration-200 ease-linear dark:bg-(--mst-color-bg-page) ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-0'
      }`}
    >
      <div className="overscroll-behavior-contain relative flex h-dvh min-w-0 touch-pan-y flex-col bg-white dark:bg-(--mst-color-bg-page)">
        <header className="flex h-14 shrink-0 items-center gap-2 px-2.5 py-1 md:px-4 md:py-1.5">
          <button
            aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
            className="cursor-pointer inline-flex h-10 items-center justify-center rounded-full border border-slate-900/8 bg-white/76 px-3 text-(--mst-color-text-secondary) shadow-(--mst-shadow-sm) backdrop-blur-sm transition-colors duration-200 hover:border-(--mst-color-border-default) hover:bg-slate-900/4 hover:text-(--mst-color-primary) dark:border-white/10 dark:bg-slate-950/66 dark:hover:bg-white/6"
            onClick={onToggleSidebar}
            type="button"
          >
            {sidebarOpen ? (
              <ChevronLeft className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="absolute inset-0 touch-pan-y overflow-y-auto">
            <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6 px-3 py-4 md:px-6 md:pt-6 md:pb-4">
              {showEmptyState ? <ChatEmptyState /> : null}

              {messages.map((message, index) => (
                <ChatMessageCard
                  isFirstMessage={index === 0}
                  key={message.id}
                  message={message}
                />
              ))}

              <div
                aria-hidden="true"
                className="min-h-6 min-w-6 shrink-0"
                ref={messagesEndRef}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-4xl px-3 pt-2 pb-4 md:px-6 md:pb-5">
          <ChatComposer
            draft={draft}
            isReplying={isReplying}
            onDraftChange={onDraftChange}
            onSelectPrompt={onSelectPrompt}
            onSubmit={onSubmit}
            showQuickPrompts={showEmptyState}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </main>
  )
}
