'use client'

import { useCallback, useState } from 'react'
import {
  ChatMainPane,
  ChatSidebar,
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import { useChatController } from './hooks'
import { ChatStoreProvider } from './store/provider'

interface ChatPageClientProps {
  initialSessions: ChatSessionPreview[]
  initialModelOptions: readonly ChatModelOption[]
  initialSelectedSessionId: string | null
  initialSelectedModelId: ChatModelId
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  persistenceEnabled: boolean
  userEmail: string | null
}

export function ChatPageClient({
  initialSessions,
  initialModelOptions,
  initialSelectedSessionId,
  initialSelectedModelId,
  initialRuntimeDebugInfoByModelId,
  persistenceEnabled,
  userEmail,
}: ChatPageClientProps) {
  return (
    <ChatStoreProvider
      initialRuntimeDebugInfoByModelId={initialRuntimeDebugInfoByModelId}
      initialSelectedModelId={initialSelectedModelId}
      initialSelectedSessionId={initialSelectedSessionId}
      initialSessions={initialSessions}
      persistenceEnabled={persistenceEnabled}
    >
      <ChatPageClientShell
        initialModelOptions={initialModelOptions}
        userEmail={userEmail}
      />
    </ChatStoreProvider>
  )
}

function ChatPageClientShell({
  initialModelOptions,
  userEmail,
}: Pick<ChatPageClientProps, 'initialModelOptions' | 'userEmail'>) {
  const [followRequestKey, setFollowRequestKey] = useState(0)
  const { composer, messages, sidebar } = useChatController()
  const { sidebarOpen, setSidebarOpen } = sidebar
  const { draft, isReplying, runtimeDebugInfo, selectedModelId } = composer
  const {
    composerRef,
    handleSelectPrompt,
    handleSendMessage,
    handleStopReply,
    setDraft,
    setSelectedModelId,
    showThinkingIndicator,
    streamingMessageId,
  } = composer
  const {
    consumePendingEditedMessageAnchor,
    editingMessageId,
    editingValue,
    handleCancelEditUserMessage,
    handleSetMessageFeedback,
    handleStartEditUserMessage,
    handleSubmitEditUserMessage,
    hasConversationMessages,
    pendingEditedMessageAnchorId,
    selectedSession,
    setEditingValue,
  } = messages
  const conversationMessages = selectedSession?.messages ?? []

  const requestFollow = useCallback(() => {
    setFollowRequestKey((value) => value + 1)
  }, [])

  const handleSubmitMessage = useCallback(
    async (inputOverride?: string) => {
      const input = (inputOverride ?? draft).trim()

      if (!isReplying && input) {
        requestFollow()
      }

      await handleSendMessage(inputOverride)
    },
    [draft, handleSendMessage, isReplying, requestFollow]
  )

  const handleSubmitPrompt = useCallback(
    async (prompt: string) => {
      requestFollow()
      await handleSelectPrompt(prompt)
    },
    [handleSelectPrompt, requestFollow]
  )

  const handleSubmitEditedMessage = useCallback(async () => {
    const didSubmit = await handleSubmitEditUserMessage()

    if (!didSubmit) {
      return
    }

    requestFollow()
    window.requestAnimationFrame(() => {
      composerRef.current?.focus()
    })
  }, [composerRef, handleSubmitEditUserMessage, requestFollow])

  return (
    <div className="group/sidebar-wrapper relative flex h-dvh w-full overflow-hidden bg-white text-(--mst-color-text-primary) antialiased dark:bg-(--mst-color-bg-page)">
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
        onDeleteAllSessions={sidebar.handleDeleteAllSessions}
        onDeleteSession={sidebar.handleDeleteSession}
        onNewSession={sidebar.handleNewSession}
        onRenameSession={sidebar.handleRenameSession}
        onSelectSession={sidebar.handleSelectSession}
        onTogglePinSession={sidebar.handleTogglePinSession}
        selectedSessionId={sidebar.selectedSessionId}
        sessions={sidebar.sessions}
        sidebarOpen={sidebarOpen}
        userEmail={userEmail}
      />

      <ChatMainPane
        activeSessionId={selectedSession?.id ?? null}
        draft={draft}
        followRequestKey={followRequestKey}
        hasConversationMessages={hasConversationMessages}
        isReplying={isReplying}
        onEditedMessageAnchorApplied={consumePendingEditedMessageAnchor}
        editingMessageId={editingMessageId}
        editingValue={editingValue}
        modelOptions={initialModelOptions}
        messages={conversationMessages}
        pendingEditedMessageAnchorId={pendingEditedMessageAnchorId}
        onCancelEditUserMessage={handleCancelEditUserMessage}
        onModelChange={setSelectedModelId}
        onDraftChange={setDraft}
        onEditingValueChange={setEditingValue}
        onMessageFeedbackChange={handleSetMessageFeedback}
        onSelectPrompt={handleSubmitPrompt}
        onStartEditUserMessage={handleStartEditUserMessage}
        onStop={handleStopReply}
        onSubmit={handleSubmitMessage}
        onSubmitEditUserMessage={handleSubmitEditedMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        runtimeDebugInfo={runtimeDebugInfo}
        showThinkingIndicator={showThinkingIndicator}
        selectedModelId={selectedModelId}
        sidebarOpen={sidebarOpen}
        streamingMessageId={streamingMessageId}
        textareaRef={composerRef}
      />
    </div>
  )
}
