'use client'

import { useCallback, useState } from 'react'
import { useAppInstance } from '@mianshitong/ui'
import {
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/app/chat/domain'
import { ChatMainPane, ChatSidebar } from '@/components'
import { useChatController } from './hooks/use-chat-controller'
import { ChatStoreProvider } from './store/provider'
import { useChatUsage } from './hooks/use-chat-usage'

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
  const { message } = useAppInstance()
  const { refreshUsage, usage, usageError, usageLoading } = useChatUsage()
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

  const ensureQuotaAvailable = useCallback(async () => {
    const currentUsage = usage ?? (await refreshUsage())

    if (!currentUsage || currentUsage.used < currentUsage.max) {
      return true
    }

    message.warning('今日模型配额已用完，请明天再试')
    return false
  }, [message, refreshUsage, usage])

  const handleSubmitMessage = useCallback(
    async (inputOverride?: string) => {
      const input = (inputOverride ?? draft).trim()

      if (!input || isReplying) {
        return
      }

      if (!(await ensureQuotaAvailable())) {
        return
      }

      if (!isReplying && input) {
        requestFollow()
      }

      await handleSendMessage(inputOverride)
      await refreshUsage()
    },
    [
      draft,
      ensureQuotaAvailable,
      handleSendMessage,
      isReplying,
      refreshUsage,
      requestFollow,
    ]
  )

  const handleSubmitPrompt = useCallback(
    async (prompt: string) => {
      if (isReplying || !(await ensureQuotaAvailable())) {
        return
      }

      requestFollow()
      await handleSelectPrompt(prompt)
      await refreshUsage()
    },
    [
      ensureQuotaAvailable,
      handleSelectPrompt,
      isReplying,
      refreshUsage,
      requestFollow,
    ]
  )

  const handleSubmitEditedMessage = useCallback(async () => {
    if (!(await ensureQuotaAvailable())) {
      return
    }

    const didSubmit = await handleSubmitEditUserMessage()

    if (!didSubmit) {
      return
    }

    await refreshUsage()
    requestFollow()
    window.requestAnimationFrame(() => {
      composerRef.current?.focus()
    })
  }, [
    composerRef,
    ensureQuotaAvailable,
    handleSubmitEditUserMessage,
    refreshUsage,
    requestFollow,
  ])

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
        usage={usage}
        usageError={usageError}
        usageLoading={usageLoading}
      />
    </div>
  )
}
