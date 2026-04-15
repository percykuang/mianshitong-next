'use client'

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
  pendingEditedMessageAnchorId,
  modelOptions,
  messages,
  onEditedMessageAnchorApplied,
  onCancelEditUserMessage,
  onModelChange,
  onDraftChange,
  onEditingValueChange,
  onMessageFeedbackChange,
  onSelectPrompt,
  onStartEditUserMessage,
  onStop,
  onSubmit,
  onSubmitEditUserMessage,
  onToggleSidebar,
  runtimeDebugInfo,
  showThinkingIndicator,
  selectedModelId,
  sidebarOpen,
  streamingMessageId,
  textareaRef,
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

  return (
    <main
      className={`relative flex h-dvh min-h-0 w-full flex-1 flex-col overflow-hidden bg-white transition-[margin] duration-200 ease-linear dark:bg-(--mst-color-bg-page) ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-0'
      }`}
    >
      <div className="overscroll-behavior-contain relative flex h-dvh min-w-0 touch-pan-y flex-col bg-white dark:bg-(--mst-color-bg-page)">
        <ChatMainPaneHeader
          onToggleSidebar={onToggleSidebar}
          runtimeDebugInfo={runtimeDebugInfo}
          sidebarOpen={sidebarOpen}
        />

        <ChatMainPaneConversation
          activeSessionId={activeSessionId}
          editingMessageId={editingMessageId}
          editingValue={editingValue}
          hasConversationMessages={hasConversationMessages}
          isPinnedToBottom={isPinnedToBottom}
          isReplying={isReplying}
          messages={messages}
          onCancelEditUserMessage={onCancelEditUserMessage}
          onEditingValueChange={onEditingValueChange}
          onMessageFeedbackChange={onMessageFeedbackChange}
          onScrollToBottom={scrollToBottom}
          onStartEditUserMessage={onStartEditUserMessage}
          onSubmitEditUserMessage={onSubmitEditUserMessage}
          scrollContainerRef={scrollContainerRef}
          showThinkingIndicator={showThinkingIndicator}
          streamingMessageId={streamingMessageId}
        />

        <div className="sticky bottom-0 z-10 mx-auto w-full max-w-4xl px-2 pb-3 md:px-4 md:pb-4">
          <ChatComposer
            draft={draft}
            isReplying={isReplying}
            modelOptions={modelOptions}
            onModelChange={onModelChange}
            onDraftChange={onDraftChange}
            onSelectPrompt={onSelectPrompt}
            onStop={onStop}
            onSubmit={onSubmit}
            selectedModelId={selectedModelId}
            showQuickPrompts={!hasConversationMessages && !isReplying}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </main>
  )
}
