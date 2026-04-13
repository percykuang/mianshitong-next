'use client'

import { type RefObject } from 'react'
import { ChevronDown } from '@mianshitong/ui'
import { ChatMessageCard, ChatThinkingMessage } from '../message'
import { ChatEmptyState } from './empty-state'
import { type ChatMainPaneProps } from './types'

interface ChatMainPaneConversationProps {
  editingMessageId: ChatMainPaneProps['editingMessageId']
  editingValue: ChatMainPaneProps['editingValue']
  hasConversationMessages: ChatMainPaneProps['hasConversationMessages']
  isPinnedToBottom: boolean
  isReplying: ChatMainPaneProps['isReplying']
  messages: ChatMainPaneProps['messages']
  onCancelEditUserMessage: ChatMainPaneProps['onCancelEditUserMessage']
  onEditingValueChange: ChatMainPaneProps['onEditingValueChange']
  onMessageFeedbackChange: ChatMainPaneProps['onMessageFeedbackChange']
  onStartEditUserMessage: ChatMainPaneProps['onStartEditUserMessage']
  onSubmitEditUserMessage: ChatMainPaneProps['onSubmitEditUserMessage']
  onScrollToBottom: () => void
  scrollContainerRef: RefObject<HTMLDivElement | null>
  showThinkingIndicator: ChatMainPaneProps['showThinkingIndicator']
  streamingMessageId: ChatMainPaneProps['streamingMessageId']
}

export function ChatMainPaneConversation({
  editingMessageId,
  editingValue,
  hasConversationMessages,
  isPinnedToBottom,
  isReplying,
  messages,
  onCancelEditUserMessage,
  onEditingValueChange,
  onMessageFeedbackChange,
  onStartEditUserMessage,
  onSubmitEditUserMessage,
  onScrollToBottom,
  scrollContainerRef,
  showThinkingIndicator,
  streamingMessageId,
}: ChatMainPaneConversationProps) {
  const showEmptyState = !hasConversationMessages && !isReplying
  const showScrollToBottomButton = hasConversationMessages && !isPinnedToBottom

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={scrollContainerRef}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-6 px-3 py-4 md:px-6 md:pt-6 md:pb-4">
          {showEmptyState ? <ChatEmptyState /> : null}

          {messages.map((message, index) => (
            <ChatMessageCard
              canEditUserMessage={!isReplying}
              editingValue={editingValue}
              isFirstMessage={index === 0}
              isEditing={editingMessageId === message.id}
              isStreaming={message.id === streamingMessageId}
              key={message.id}
              message={message}
              onCancelEditUserMessage={onCancelEditUserMessage}
              onEditingValueChange={onEditingValueChange}
              onFeedbackChange={(feedback) =>
                onMessageFeedbackChange(message.id, feedback)
              }
              onStartEditUserMessage={() =>
                onStartEditUserMessage(message.id, message.content)
              }
              onSubmitEditUserMessage={onSubmitEditUserMessage}
            />
          ))}

          {showThinkingIndicator ? <ChatThinkingMessage /> : null}

          <div aria-hidden="true" className="min-h-6 min-w-6 shrink-0" />
        </div>
      </div>

      {showScrollToBottomButton ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center pb-3 md:pb-4">
          <button
            aria-label="回到底部"
            className="pointer-events-auto inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-(--mst-color-border-default) bg-white/90 text-(--mst-color-text-secondary) shadow-[0_8px_18px_rgb(15_23_42/0.16)] backdrop-blur-sm transition-colors duration-200 hover:bg-white dark:bg-slate-900/88 dark:text-zinc-300 dark:hover:bg-slate-900"
            onClick={onScrollToBottom}
            type="button"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
