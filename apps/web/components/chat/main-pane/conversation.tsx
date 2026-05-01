'use client'
import { ChevronDown } from '@mianshitong/ui'

import { ChatMessageCard, ChatThinkingMessage } from '../message'
import { ChatEmptyState } from './empty-state'
import { type ChatMainPaneProps } from './types'

interface ChatMainPaneConversationProps {
  activeSessionId: ChatMainPaneProps['activeSessionId']
  editingMessageId: ChatMainPaneProps['editingMessageId']
  editingValue: ChatMainPaneProps['editingValue']
  hasConversationMessages: ChatMainPaneProps['hasConversationMessages']
  isPinnedToBottom: boolean
  isReplying: ChatMainPaneProps['isReplying']
  modelCatalog: ChatMainPaneProps['modelCatalog']
  messages: ChatMainPaneProps['messages']
  onCancelEditUserMessage: ChatMainPaneProps['onCancelEditUserMessage']
  onEditingValueChange: ChatMainPaneProps['onEditingValueChange']
  onMessageFeedbackChange: ChatMainPaneProps['onMessageFeedbackChange']
  onRetryModelCatalog: ChatMainPaneProps['onRetryModelCatalog']
  onStartEditUserMessage: ChatMainPaneProps['onStartEditUserMessage']
  onSubmitEditUserMessage: ChatMainPaneProps['onSubmitEditUserMessage']
  onScrollToBottom: () => void
  scrollContainerRef: (node: HTMLDivElement | null) => void
  showThinkingIndicator: ChatMainPaneProps['showThinkingIndicator']
  streamingMessageId: ChatMainPaneProps['streamingMessageId']
}

export function ChatMainPaneConversation({
  activeSessionId,
  editingMessageId,
  editingValue,
  hasConversationMessages,
  isPinnedToBottom,
  isReplying,
  modelCatalog,
  messages,
  onCancelEditUserMessage,
  onEditingValueChange,
  onMessageFeedbackChange,
  onRetryModelCatalog,
  onStartEditUserMessage,
  onSubmitEditUserMessage,
  onScrollToBottom,
  scrollContainerRef,
  showThinkingIndicator,
  streamingMessageId,
}: ChatMainPaneConversationProps) {
  const showEmptyState = !hasConversationMessages && !isReplying
  const showScrollToBottomButton = hasConversationMessages && !isPinnedToBottom
  const messageKeyPrefix = activeSessionId ?? 'empty'
  const emptyStateStatus =
    modelCatalog.status === 'ready' ? 'default' : modelCatalog.status
  const lastEditableUserMessageId =
    [...messages].reverse().find((message) => message.role === 'user')?.id ??
    null

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        key={messageKeyPrefix}
        ref={scrollContainerRef}
      >
        <div className="mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6 px-3 py-4 md:px-6 md:pt-6 md:pb-4">
          {showEmptyState ? (
            <ChatEmptyState
              message={modelCatalog.message}
              onRetry={
                emptyStateStatus === 'empty' || emptyStateStatus === 'error'
                  ? onRetryModelCatalog
                  : undefined
              }
              status={emptyStateStatus}
            />
          ) : null}

          {messages.map((message, index) => (
            <ChatMessageCard
              canEditUserMessage={
                !isReplying && message.id === lastEditableUserMessageId
              }
              editingValue={editingValue}
              isFirstMessage={index === 0}
              isEditing={editingMessageId === message.id}
              isStreaming={message.id === streamingMessageId}
              key={`${messageKeyPrefix}:${message.id}`}
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
