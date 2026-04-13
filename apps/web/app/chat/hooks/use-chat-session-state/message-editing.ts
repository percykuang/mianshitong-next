'use client'

import { useState } from 'react'
import { type Dispatch, type SetStateAction } from 'react'
import { type ChatSessionPreview } from '@/components'
import { type ChatSessionEditingState } from './types'

interface UseChatMessageEditingOptions {
  selectedSessionId: string | null
  setSessions: Dispatch<SetStateAction<ChatSessionPreview[]>>
}

export function useChatMessageEditing({
  selectedSessionId,
  setSessions,
}: UseChatMessageEditingOptions): ChatSessionEditingState {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  function resetEditingState() {
    setEditingMessageId(null)
    setEditingValue('')
  }

  function handleStartEditUserMessage(messageId: string, content: string) {
    setEditingMessageId(messageId)
    setEditingValue(content)
  }

  function handleCancelEditUserMessage() {
    resetEditingState()
  }

  function handleSubmitEditUserMessage() {
    const nextContent = editingValue.trim()

    if (!selectedSessionId || !editingMessageId || !nextContent) {
      return
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (session.id !== selectedSessionId) {
          return session
        }

        const targetMessage = session.messages.find(
          (message) => message.id === editingMessageId
        )

        if (!targetMessage) {
          return session
        }

        return {
          ...session,
          preview:
            session.preview === targetMessage.content
              ? nextContent
              : session.preview,
          messages: session.messages.map((message) =>
            message.id === editingMessageId
              ? { ...message, content: nextContent }
              : message
          ),
        }
      })
    )

    resetEditingState()
  }

  return {
    editingMessageId,
    editingValue,
    handleCancelEditUserMessage,
    handleStartEditUserMessage,
    handleSubmitEditUserMessage,
    resetEditingState,
    setEditingValue,
  }
}
