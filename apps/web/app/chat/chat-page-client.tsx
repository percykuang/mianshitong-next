'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

import { useAppInstance } from '@mianshitong/ui'

import {
  type ChatModelId,
  type ChatModelOption,
  type ChatRuntimeDebugInfo,
  type ChatSessionPreview,
} from '@/app/chat/domain'
import { ChatMainPane, ChatSidebar } from '@/components'

import { useChatController } from './hooks/use-chat-controller'
import { useChatUsage } from './hooks/use-chat-usage'
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

function focusComposer(composerRef: RefObject<HTMLTextAreaElement | null>) {
  window.requestAnimationFrame(() => {
    composerRef.current?.focus()
  })
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
  const selectedSessionId = selectedSession?.id ?? null
  const previousSelectedSessionIdRef = useRef<string | null>(selectedSessionId)

  const requestFollow = () => {
    setFollowRequestKey((value) => value + 1)
  }

  const ensureQuotaAvailable = async () => {
    const currentUsage = usage ?? (await refreshUsage())

    if (!currentUsage || currentUsage.used < currentUsage.max) {
      return true
    }

    message.warning('今日模型配额已用完，请明天再试')
    return false
  }

  const handleSubmitMessage = async (inputOverride?: string) => {
    // 兼容“直接传入内容发送”和“读取当前输入框草稿发送”两种入口。
    const input = (inputOverride ?? draft).trim()

    // 空消息不发送；正在生成回复时也禁止再次提交，避免并发请求打乱会话状态。
    if (!input || isReplying) {
      return
    }

    // 发送前先检查当日调用额度，避免进入后续请求链路后再报错。
    if (!(await ensureQuotaAvailable())) {
      return
    }

    // 触发主面板跟随到底部，让新一轮“用户消息 + AI 回复”滚动行为更自然。
    if (!isReplying && input) {
      requestFollow()
    }

    // 真正的发送逻辑在 chat store 里，这里只负责把提交动作转交给 store action。
    await handleSendMessage(inputOverride)
    // 发送完成后刷新额度展示，确保 UI 上的已用次数与服务端保持一致。
    await refreshUsage()
    focusComposer(composerRef)
  }

  const handleSubmitPrompt = async (prompt: string) => {
    if (isReplying || !(await ensureQuotaAvailable())) {
      return
    }

    requestFollow()
    await handleSelectPrompt(prompt)
    await refreshUsage()
    focusComposer(composerRef)
  }

  const handleSubmitEditedMessage = async () => {
    if (!(await ensureQuotaAvailable())) {
      return
    }

    const didSubmit = await handleSubmitEditUserMessage()

    if (!didSubmit) {
      return
    }

    await refreshUsage()
    requestFollow()
    focusComposer(composerRef)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarOpen((value) => !value)
  }

  useEffect(() => {
    focusComposer(composerRef)
  }, [composerRef])

  useEffect(() => {
    // 只有真正发生“切换会话 / 新建会话”时才需要再次回焦；
    // 首次渲染或 selectedSessionId 没变化时，直接跳过，避免重复抢焦点。
    if (previousSelectedSessionIdRef.current === selectedSessionId) {
      return
    }

    previousSelectedSessionIdRef.current = selectedSessionId

    focusComposer(composerRef)
  }, [composerRef, selectedSessionId])

  return (
    <div className="group/sidebar-wrapper relative flex h-dvh w-full overflow-hidden bg-white text-(--mst-color-text-primary) antialiased dark:bg-(--mst-color-bg-page)">
      {sidebarOpen ? (
        <button
          aria-label="关闭侧栏"
          className="fixed inset-0 z-30 cursor-pointer bg-slate-950/18 backdrop-blur-[2px] md:hidden"
          onClick={closeSidebar}
          type="button"
        />
      ) : null}

      <ChatSidebar
        onCloseSidebar={closeSidebar}
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
        onToggleSidebar={toggleSidebar}
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
