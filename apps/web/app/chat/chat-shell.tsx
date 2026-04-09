'use client'

import {
  ChatMainPane,
  ChatSidebar,
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
} from '@/components'
import { useChatController } from './use-chat-controller'

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
  const {
    composerRef,
    draft,
    handleDeleteSession,
    handleLogout,
    handleNewSession,
    handleSelectPrompt,
    handleSelectSession,
    handleSendMessage,
    handleStopReply,
    handleTogglePinSession,
    hasConversationMessages,
    isReplying,
    runtimeDebugInfo,
    selectedModelId,
    selectedSession,
    selectedSessionId,
    sessions,
    setDraft,
    setSelectedModelId,
    setSidebarOpen,
    showThinkingIndicator,
    sidebarOpen,
    streamingMessageId,
  } = useChatController({
    initialRuntimeDebugInfoByModelId,
    initialSelectedModelId,
  })

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
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
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
        modelOptions={initialModelOptions}
        messages={selectedSession?.messages ?? []}
        onModelChange={setSelectedModelId}
        onDraftChange={setDraft}
        onSelectPrompt={handleSelectPrompt}
        onStop={handleStopReply}
        onSubmit={handleSendMessage}
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
