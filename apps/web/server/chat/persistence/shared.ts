import { type DbTransaction, db } from '@mianshitong/db'

import {
  type ChatMessageCompletionStatus,
  createChatSessionTitle,
} from '@/app/chat/domain'

export { createChatSessionTitle }
export type { ChatMessageCompletionStatus }

export const chatDb = db
export type ChatDbTransaction = DbTransaction

function normalizeComparableMessageContent(content: string) {
  return content.trim()
}

export function isSameAssistantReply(
  message:
    | {
        content: string
        role: 'assistant' | 'user'
      }
    | null
    | undefined,
  content: string
) {
  if (!message || message.role !== 'assistant') {
    return false
  }

  return (
    normalizeComparableMessageContent(message.content) ===
    normalizeComparableMessageContent(content)
  )
}

export function shouldRetryAssistantReplyWithoutCompletionStatus(
  error: unknown
) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code =
    'code' in error && typeof error.code === 'string' ? error.code : ''
  const message =
    'message' in error && typeof error.message === 'string' ? error.message : ''

  return (
    code === 'P2022' ||
    message.includes('Unknown argument `completionStatus`') ||
    message.includes('Unknown arg `completionStatus`') ||
    (message.includes('completionStatus') && message.includes('does not exist'))
  )
}
