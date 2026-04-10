'use client'

import {
  ChatMainPane,
  ChatSidebar,
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
} from '@/components'
import {
  DeleteSessionDialog,
  RenameSessionDialog,
} from './chat-session-dialogs'
import { useChatController } from '../hooks/use-chat-controller'

interface ChatShellProps {
  initialModelOptions: readonly ChatModelOption[]
  initialSelectedModelId: ChatModelId
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  userEmail: string | null
}

export function ChatShell({
  initialModelOptions,
  initialSelectedModelId,
  initialRuntimeDebugInfoByModelId,
  userEmail,
}: ChatShellProps) {
  const { composer, dialogs, messages, sidebar } = useChatController({
    initialRuntimeDebugInfoByModelId,
    initialSelectedModelId,
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
  const {
    deletingSession,
    handleCloseDeleteDialog,
    handleCloseRenameDialog,
    handleConfirmDeleteSession,
    handleConfirmRenameSession,
    renameDraft,
    renamingSession,
    setRenameDraft,
  } = dialogs
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
        onDeleteSession={sidebar.handleDeleteSession}
        onLogout={sidebar.handleLogout}
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

      <DeleteSessionDialog
        onCancel={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteSession}
        session={deletingSession}
      />

      <RenameSessionDialog
        draft={renameDraft}
        onCancel={handleCloseRenameDialog}
        onConfirm={handleConfirmRenameSession}
        onDraftChange={setRenameDraft}
        session={renamingSession}
      />
    </div>
  )
}
