'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useThemeMode } from '@mianshitong/ui'
import {
  useChatPathSyncEffect,
  useChatSessionSelectionRouteSyncEffect,
  useCodeHighlightWarmupEffect,
} from './effects'
import { useChatControllerSidebarActions } from './sidebar-actions'
import {
  type UseChatControllerOptions,
  type UseChatControllerResult,
} from './types'
import { useChatReplyState } from '../use-chat-reply-state'
import { useChatSessionState } from '../use-chat-session-state'
import { getRouteSessionIdFromPathname } from '../../utils'

export type {
  ChatControllerComposerGroup,
  ChatControllerMessagesGroup,
  ChatControllerSidebarGroup,
  UseChatControllerResult,
} from './types'

export function useChatController({
  initialSessions,
  initialSelectedSessionId,
  initialRuntimeDebugInfoByModelId,
  initialSelectedModelId,
  persistenceEnabled,
}: UseChatControllerOptions): UseChatControllerResult {
  const { themeMode } = useThemeMode()
  const router = useRouter()
  const pathname = usePathname()
  const routeSessionId = getRouteSessionIdFromPathname(pathname)
  const sessionState = useChatSessionState({
    initialSessions,
    initialSelectedSessionId,
    persistenceEnabled,
  })
  const replyState = useChatReplyState({
    initialRuntimeDebugInfoByModelId,
    initialSelectedModelId,
    persistenceEnabled,
    selectedSessionId: sessionState.selectedSessionId,
    sessions: sessionState.sessions,
    setSelectedSessionId: sessionState.setSelectedSessionId,
    setSessions: sessionState.setSessions,
  })
  const sidebar = useChatControllerSidebarActions({
    replyState,
    sessionState,
  })

  useCodeHighlightWarmupEffect({
    isReplying: replyState.isReplying,
    sessions: sessionState.sessions,
    themeMode,
  })
  useChatSessionSelectionRouteSyncEffect({
    isReplying: replyState.isReplying,
    pathname,
    persistenceEnabled,
    routeSessionId,
    selectedSessionId: sessionState.selectedSessionId,
    sessions: sessionState.sessions,
    onSelectRouteNewSession: sessionState.handleNewSession,
    onSelectRouteSession: sessionState.handleSelectSession,
  })
  useChatPathSyncEffect({
    isReplying: replyState.isReplying,
    pathname,
    persistenceEnabled,
    selectedSessionId: sessionState.selectedSessionId,
    replacePath(targetPath) {
      router.replace(targetPath, {
        scroll: false,
      })
    },
  })

  function handleStartEditUserMessage(messageId: string, content: string) {
    if (replyState.isReplying) {
      return
    }

    sessionState.handleStartEditUserMessage(messageId, content)
  }

  return {
    composer: {
      composerRef: replyState.composerRef,
      draft: replyState.draft,
      handleSelectPrompt: replyState.handleSelectPrompt,
      handleSendMessage: replyState.handleSendMessage,
      handleStopReply: replyState.handleStopReply,
      isReplying: replyState.isReplying,
      runtimeDebugInfo: replyState.runtimeDebugInfo,
      selectedModelId: replyState.selectedModelId,
      setDraft: replyState.setDraft,
      setSelectedModelId: replyState.setSelectedModelId,
      showThinkingIndicator: replyState.showThinkingIndicator,
      streamingMessageId: replyState.streamingMessageId,
    },
    messages: {
      editingMessageId: sessionState.editingMessageId,
      editingValue: sessionState.editingValue,
      handleCancelEditUserMessage: sessionState.handleCancelEditUserMessage,
      handleSetMessageFeedback: sessionState.handleSetMessageFeedback,
      handleStartEditUserMessage,
      handleSubmitEditUserMessage: sessionState.handleSubmitEditUserMessage,
      hasConversationMessages: sessionState.hasConversationMessages,
      selectedSession: sessionState.selectedSession,
      setEditingValue: sessionState.setEditingValue,
    },
    sidebar,
  }
}
