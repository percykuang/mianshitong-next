'use client'

import { Info, Loader } from '@mianshitong/ui'

import { ChatComposer } from '../composer'
import { ChatMainPaneConversation } from './conversation'
import { ChatMainPaneHeader } from './header'
import { type ChatMainPaneProps } from './types'
import { useChatMainPaneScroll } from './use-chat-main-pane-scroll'

export function ChatMainPane({
  activeSessionId,
  draft,
  followRequestKey,
  hasConversationMessages,
  isReplying,
  editingMessageId,
  editingValue,
  modelCatalog,
  pendingEditedMessageAnchorId,
  modelOptions,
  messages,
  onEditedMessageAnchorApplied,
  onCancelEditUserMessage,
  onModelChange,
  onDraftChange,
  onEditingValueChange,
  onMessageFeedbackChange,
  onRetryModelCatalog,
  onSelectPrompt,
  onStartEditUserMessage,
  onStop,
  onSubmit,
  onSubmitEditUserMessage,
  onToggleSidebar,
  showThinkingIndicator,
  selectedModelId,
  sidebarOpen,
  streamingMessageId,
  textareaRef,
  usage,
  usageError,
  usageLoading,
}: ChatMainPaneProps) {
  const { isPinnedToBottom, scrollContainerRef, scrollToBottom } =
    useChatMainPaneScroll({
      activeSessionId,
      editingMessageId,
      followRequestKey,
      isReplying,
      lastMessageContent: messages.at(-1)?.content,
      messageCount: messages.length,
      onEditedMessageAnchorApplied,
      pendingEditedMessageAnchorId,
    })
  const showModelCatalogNotice =
    modelOptions.length === 0 || selectedModelId.trim().length === 0
  const composerDisabledReason = showModelCatalogNotice
    ? modelCatalog.status === 'loading'
      ? '正在加载模型配置...'
      : modelCatalog.message || '当前系统还没有可用模型。'
    : ''

  return (
    <main
      className={`relative flex h-dvh min-h-0 w-full flex-1 flex-col overflow-hidden bg-white transition-[margin] duration-200 ease-linear dark:bg-(--mst-color-bg-page) ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-0'
      }`}
    >
      <div className="overscroll-behavior-contain relative flex h-dvh min-w-0 touch-pan-y flex-col bg-white dark:bg-(--mst-color-bg-page)">
        <ChatMainPaneHeader
          onToggleSidebar={onToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        <ChatMainPaneConversation
          activeSessionId={activeSessionId}
          editingMessageId={editingMessageId}
          editingValue={editingValue}
          hasConversationMessages={hasConversationMessages}
          isPinnedToBottom={isPinnedToBottom}
          isReplying={isReplying}
          modelCatalog={modelCatalog}
          messages={messages}
          onCancelEditUserMessage={onCancelEditUserMessage}
          onEditingValueChange={onEditingValueChange}
          onMessageFeedbackChange={onMessageFeedbackChange}
          onRetryModelCatalog={onRetryModelCatalog}
          onScrollToBottom={scrollToBottom}
          onStartEditUserMessage={onStartEditUserMessage}
          onSubmitEditUserMessage={onSubmitEditUserMessage}
          scrollContainerRef={scrollContainerRef}
          showThinkingIndicator={showThinkingIndicator}
          streamingMessageId={streamingMessageId}
        />

        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-4xl px-2 pb-3 md:px-4 md:pb-4">
          {showModelCatalogNotice ? (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-(--mst-color-border-default) bg-white/92 px-3 py-2 text-sm text-(--mst-color-text-secondary) shadow-(--mst-shadow-sm) backdrop-blur-sm dark:bg-slate-950/84">
              <div className="flex min-w-0 items-center gap-2">
                {modelCatalog.status === 'loading' ? (
                  <Loader className="size-4 shrink-0 animate-spin text-(--mst-color-primary)" />
                ) : (
                  <Info className="size-4 shrink-0 text-(--mst-color-primary)" />
                )}
                <span className="min-w-0 truncate">
                  {composerDisabledReason}
                </span>
              </div>

              {modelCatalog.status === 'empty' ||
              modelCatalog.status === 'error' ? (
                <button
                  className="shrink-0 cursor-pointer text-sm font-medium text-(--mst-color-primary) transition-opacity duration-200 hover:opacity-80"
                  onClick={onRetryModelCatalog}
                  type="button"
                >
                  重新加载
                </button>
              ) : null}
            </div>
          ) : null}

          <ChatComposer
            disabled={showModelCatalogNotice}
            disabledReason={composerDisabledReason}
            draft={draft}
            isReplying={isReplying}
            modelOptions={modelOptions}
            onModelChange={onModelChange}
            onDraftChange={onDraftChange}
            onSelectPrompt={onSelectPrompt}
            onStop={onStop}
            onSubmit={onSubmit}
            selectedModelId={selectedModelId}
            showQuickPrompts={
              !showModelCatalogNotice && !hasConversationMessages && !isReplying
            }
            textareaRef={textareaRef}
            usage={usage}
            usageError={usageError}
            usageLoading={usageLoading}
          />
        </div>
      </div>
    </main>
  )
}
