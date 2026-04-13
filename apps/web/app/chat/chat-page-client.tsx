'use client'

import {
  ChatMainPane,
  ChatSidebar,
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/components'
import { useChatController } from './hooks'

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
  const { composer, messages, sidebar } = useChatController({
    initialSessions,
    initialSelectedSessionId,
    initialRuntimeDebugInfoByModelId,
    initialSelectedModelId,
    persistenceEnabled,
  })
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
    editingMessageId,
    editingValue,
    handleCancelEditUserMessage,
    handleSetMessageFeedback,
    handleStartEditUserMessage,
    handleSubmitEditUserMessage,
    hasConversationMessages,
    selectedSession,
    setEditingValue,
  } = messages
  const conversationMessages = selectedSession?.messages ?? []

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
        hasConversationMessages={hasConversationMessages}
        isReplying={isReplying}
        editingMessageId={editingMessageId}
        editingValue={editingValue}
        modelOptions={initialModelOptions}
        messages={conversationMessages}
        onCancelEditUserMessage={handleCancelEditUserMessage}
        onModelChange={setSelectedModelId}
        onDraftChange={setDraft}
        onEditingValueChange={setEditingValue}
        onMessageFeedbackChange={handleSetMessageFeedback}
        onSelectPrompt={handleSelectPrompt}
        onStartEditUserMessage={handleStartEditUserMessage}
        onStop={handleStopReply}
        onSubmit={handleSendMessage}
        onSubmitEditUserMessage={handleSubmitEditUserMessage}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
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
