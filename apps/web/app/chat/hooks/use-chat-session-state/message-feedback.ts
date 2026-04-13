'use client'

import { useRef } from 'react'
import { type ChatMessageFeedback } from '@/components'
import { updatePersistedChatMessageFeedback } from '../../utils'
import {
  type ChatMessageFeedbackOptions,
  type ChatMessageFeedbackState,
} from './types'

export function useChatMessageFeedback({
  persistenceEnabled,
  selectedSession,
  selectedSessionId,
  setSessions,
}: ChatMessageFeedbackOptions): ChatMessageFeedbackState {
  const feedbackMutationVersionRef = useRef(new Map<string, number>())

  function handleSetMessageFeedback(
    messageId: string,
    feedback: ChatMessageFeedback | null
  ) {
    if (!selectedSessionId) {
      return
    }

    const targetSessionId = selectedSessionId
    const previousFeedback =
      selectedSession?.messages.find((message) => message.id === messageId)
        ?.feedback ?? null

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === targetSessionId
          ? {
              ...session,
              messages: session.messages.map((message) =>
                message.id === messageId
                  ? { ...message, feedback: feedback ?? undefined }
                  : message
              ),
            }
          : session
      )
    )

    if (!persistenceEnabled) {
      return
    }

    const mutationKey = `${targetSessionId}:${messageId}`
    const nextMutationVersion =
      (feedbackMutationVersionRef.current.get(mutationKey) ?? 0) + 1
    feedbackMutationVersionRef.current.set(mutationKey, nextMutationVersion)

    void updatePersistedChatMessageFeedback(
      targetSessionId,
      messageId,
      feedback
    )
      .then((updatedSession) => {
        if (
          feedbackMutationVersionRef.current.get(mutationKey) !==
          nextMutationVersion
        ) {
          return
        }

        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            session.id === targetSessionId ? updatedSession : session
          )
        )
      })
      .catch((error) => {
        if (
          feedbackMutationVersionRef.current.get(mutationKey) !==
          nextMutationVersion
        ) {
          return
        }

        console.error(
          '[chat-session-state] update message feedback failed',
          error
        )

        setSessions((currentSessions) =>
          currentSessions.map((session) =>
            session.id !== targetSessionId
              ? session
              : {
                  ...session,
                  messages: session.messages.map((message) =>
                    message.id === messageId
                      ? {
                          ...message,
                          feedback: previousFeedback ?? undefined,
                        }
                      : message
                  ),
                }
          )
        )
      })
  }

  return {
    handleSetMessageFeedback,
  }
}
