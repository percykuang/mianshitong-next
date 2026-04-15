'use client'

import { useCallback, useState } from 'react'
import { type ChatSessionEditingState } from './types'

export function useChatMessageEditing(): ChatSessionEditingState {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [pendingEditedMessageAnchorId, setPendingEditedMessageAnchorId] =
    useState<string | null>(null)

  function resetEditingState() {
    setEditingMessageId(null)
    setEditingValue('')
  }

  const consumePendingEditedMessageAnchor = useCallback(() => {
    setPendingEditedMessageAnchorId(null)
  }, [])

  function handleStartEditUserMessage(messageId: string, content: string) {
    setPendingEditedMessageAnchorId(null)
    setEditingMessageId(messageId)
    setEditingValue(content)
  }

  function handleCancelEditUserMessage() {
    setPendingEditedMessageAnchorId(null)
    resetEditingState()
  }

  function queuePendingEditedMessageAnchor(messageId: string) {
    setPendingEditedMessageAnchorId(messageId)
  }

  return {
    consumePendingEditedMessageAnchor,
    editingMessageId,
    editingValue,
    handleCancelEditUserMessage,
    handleStartEditUserMessage,
    pendingEditedMessageAnchorId,
    queuePendingEditedMessageAnchor,
    resetEditingState,
    setEditingValue,
  }
}
