'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

import { useAppInstance } from '@mianshitong/ui'

import {
  type ChatModelCatalogState,
  type ChatSessionPreview,
} from '@/app/chat/domain'
import { ChatMainPane, ChatSidebar } from '@/components'

import { useChatController } from './hooks/use-chat-controller'
import { useChatUsage } from './hooks/use-chat-usage'
import { ChatStoreProvider } from './store/provider'

interface ChatPageClientProps {
  initialModelCatalog: ChatModelCatalogState
  initialSessions: ChatSessionPreview[]
  initialSelectedSessionId: string | null
  persistenceEnabled: boolean
  userEmail: string | null
}

function isResolvedModelCatalogState(
  value: unknown
): value is Extract<
  ChatModelCatalogState,
  { status: 'empty' | 'error' | 'ready' }
> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    (value.status === 'ready' ||
      value.status === 'empty' ||
      value.status === 'error') &&
    'message' in value &&
    typeof value.message === 'string' &&
    'selectedModelId' in value &&
    typeof value.selectedModelId === 'string' &&
    'models' in value &&
    Array.isArray(value.models)
  )
}

function createLoadingModelCatalogState(
  currentValue: ChatModelCatalogState
): ChatModelCatalogState {
  return {
    ...currentValue,
    message: '正在加载模型配置...',
    status: 'loading',
  }
}

async function fetchModelCatalogState() {
  const response = await fetch('/api/models', {
    cache: 'no-store',
  })
  const payload = (await response.json().catch(() => null)) as unknown

  if (!isResolvedModelCatalogState(payload)) {
    throw new Error('invalid_model_catalog_response')
  }

  return payload
}

function focusComposer(composerRef: RefObject<HTMLTextAreaElement | null>) {
  window.requestAnimationFrame(() => {
    composerRef.current?.focus()
  })
}

export function ChatPageClient({
  initialModelCatalog,
  initialSessions,
  initialSelectedSessionId,
  persistenceEnabled,
  userEmail,
}: ChatPageClientProps) {
  return (
    <ChatStoreProvider
      initialSelectedModelId={initialModelCatalog.selectedModelId}
      initialSelectedSessionId={initialSelectedSessionId}
      initialSessions={initialSessions}
      persistenceEnabled={persistenceEnabled}
    >
      <ChatPageClientShell
        initialModelCatalog={initialModelCatalog}
        userEmail={userEmail}
      />
    </ChatStoreProvider>
  )
}

function ChatPageClientShell({
  initialModelCatalog,
  userEmail,
}: Pick<ChatPageClientProps, 'initialModelCatalog' | 'userEmail'>) {
  const [followRequestKey, setFollowRequestKey] = useState(0)
  const [modelCatalog, setModelCatalog] = useState(initialModelCatalog)
  const { message } = useAppInstance()
  const { refreshUsage, usage, usageError, usageLoading } = useChatUsage()
  const { composer, messages, sidebar } = useChatController()
  const { sidebarOpen, setSidebarOpen } = sidebar
  const { draft, isReplying, selectedModelId } = composer
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
  const resolvedSelectedModelId =
    selectedModelId ||
    modelCatalog.selectedModelId ||
    modelCatalog.models[0]?.id ||
    ''
  const canUseChatModels =
    modelCatalog.models.length > 0 && resolvedSelectedModelId.trim().length > 0

  const requestFollow = () => {
    setFollowRequestKey((value) => value + 1)
  }

  const handleRetryModelCatalog = async () => {
    setModelCatalog((currentValue) =>
      createLoadingModelCatalogState(currentValue)
    )

    try {
      const nextModelCatalog = await fetchModelCatalogState()
      const shouldKeepCurrentModel = nextModelCatalog.models.some(
        (model) => model.id === selectedModelId
      )
      const nextSelectedModelId =
        nextModelCatalog.selectedModelId || nextModelCatalog.models[0]?.id || ''

      setModelCatalog(nextModelCatalog)
      setSelectedModelId(
        nextModelCatalog.models.length > 0
          ? shouldKeepCurrentModel
            ? selectedModelId
            : nextSelectedModelId
          : ''
      )
    } catch {
      setModelCatalog({
        message: '模型服务暂时不可用，请稍后重试。',
        models: [],
        selectedModelId: '',
        status: 'error',
      })
      setSelectedModelId('')
    }
  }

  useEffect(() => {
    if (!canUseChatModels) {
      return
    }

    const hasMatchedSelectedModel = modelCatalog.models.some(
      (model) => model.id === selectedModelId
    )

    if (
      !hasMatchedSelectedModel &&
      resolvedSelectedModelId !== selectedModelId
    ) {
      setSelectedModelId(resolvedSelectedModelId)
    }
  }, [
    canUseChatModels,
    modelCatalog.models,
    resolvedSelectedModelId,
    selectedModelId,
    setSelectedModelId,
  ])

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
    if (!input || isReplying || !canUseChatModels) {
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
    if (isReplying || !canUseChatModels || !(await ensureQuotaAvailable())) {
      return
    }

    requestFollow()
    await handleSelectPrompt(prompt)
    await refreshUsage()
    focusComposer(composerRef)
  }

  const handleSubmitEditedMessage = async () => {
    if (!canUseChatModels || !(await ensureQuotaAvailable())) {
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
    if (!canUseChatModels) {
      return
    }

    focusComposer(composerRef)
  }, [canUseChatModels, composerRef])

  useEffect(() => {
    if (!canUseChatModels) {
      return
    }

    // 只有真正发生“切换会话 / 新建会话”时才需要再次回焦；
    // 首次渲染或 selectedSessionId 没变化时，直接跳过，避免重复抢焦点。
    if (previousSelectedSessionIdRef.current === selectedSessionId) {
      return
    }

    previousSelectedSessionIdRef.current = selectedSessionId

    focusComposer(composerRef)
  }, [canUseChatModels, composerRef, selectedSessionId])

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
        generatingTitleSessionIds={sidebar.generatingTitleSessionIds}
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
        modelCatalog={modelCatalog}
        onEditedMessageAnchorApplied={consumePendingEditedMessageAnchor}
        editingMessageId={editingMessageId}
        editingValue={editingValue}
        modelOptions={modelCatalog.models}
        messages={conversationMessages}
        pendingEditedMessageAnchorId={pendingEditedMessageAnchorId}
        onCancelEditUserMessage={handleCancelEditUserMessage}
        onModelChange={setSelectedModelId}
        onDraftChange={setDraft}
        onEditingValueChange={setEditingValue}
        onMessageFeedbackChange={handleSetMessageFeedback}
        onRetryModelCatalog={handleRetryModelCatalog}
        onSelectPrompt={handleSubmitPrompt}
        onStartEditUserMessage={handleStartEditUserMessage}
        onStop={handleStopReply}
        onSubmit={handleSubmitMessage}
        onSubmitEditUserMessage={handleSubmitEditedMessage}
        onToggleSidebar={toggleSidebar}
        showThinkingIndicator={showThinkingIndicator}
        selectedModelId={resolvedSelectedModelId}
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
