'use client'

import { App } from 'antd'
import { useState } from 'react'
import { Modal } from '@mianshitong/ui'
import {
  type ChatControllerSidebarGroup,
  type ChatReplyStateLike,
  type ChatSessionStateLike,
} from './types'

interface UseChatControllerSidebarActionsOptions {
  replyState: Pick<ChatReplyStateLike, 'setDraft'>
  sessionState: Pick<
    ChatSessionStateLike,
    | 'handleDeleteAllSessions'
    | 'handleDeleteSession'
    | 'handleInterruptAndNewSession'
    | 'handleInterruptAndSelectSession'
    | 'handleNewSession'
    | 'handleRenameSession'
    | 'handleSelectSession'
    | 'handleTogglePinSession'
    | 'selectedSessionId'
    | 'sessions'
  >
}

export function useChatControllerSidebarActions({
  replyState,
  sessionState,
}: UseChatControllerSidebarActionsOptions): ChatControllerSidebarGroup {
  const { message } = App.useApp()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const sessions = sessionState.sessions

  function handleNewSession() {
    void sessionState.handleInterruptAndNewSession()
  }

  function handleDeleteAllSessions() {
    if (sessions.length === 0) {
      return
    }

    Modal.confirm({
      centered: true,
      content: '删除后，会话记录将不可恢复。',
      confirmText: '删除',
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        const deletedCount = await sessionState.handleDeleteAllSessions()

        if (deletedCount === null) {
          throw new Error('delete all sessions failed')
        }

        if (deletedCount > 0) {
          message.success(`已删除 ${deletedCount} 条会话`)
        } else {
          message.info('暂无会话可删除')
        }

        replyState.setDraft('')
      },
      title: '确定删除所有对话?',
    })
  }

  function handleDeleteSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)

    if (!targetSession) {
      return
    }

    Modal.confirm({
      content: '删除后，会话记录将不可恢复。',
      confirmText: '删除',
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        const deleted = await sessionState.handleDeleteSession(targetSession.id)

        if (!deleted) {
          throw new Error('delete session failed')
        }
      },
      title: '确定删除对话?',
    })
  }

  function handleRenameSession(sessionId: string) {
    const targetSession = sessions.find((session) => session.id === sessionId)

    if (!targetSession) {
      return
    }

    Modal.prompt({
      icon: null,
      confirmText: '保存',
      defaultValue: targetSession.title,
      maxLength: 60,
      onOk: async (value) => {
        const renamed = await sessionState.handleRenameSession(
          targetSession.id,
          value
        )

        if (!renamed) {
          throw new Error('rename session failed')
        }
      },
      placeholder: '请输入会话名称',
      required: true,
      title: '重命名会话',
    })
  }

  return {
    handleDeleteAllSessions,
    handleDeleteSession,
    handleNewSession,
    handleRenameSession,
    handleSelectSession(sessionId) {
      void sessionState.handleInterruptAndSelectSession(sessionId)
    },
    handleTogglePinSession: sessionState.handleTogglePinSession,
    selectedSessionId: sessionState.selectedSessionId,
    sessions,
    setSidebarOpen,
    sidebarOpen,
  }
}
