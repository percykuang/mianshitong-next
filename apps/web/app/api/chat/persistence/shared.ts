import { prisma } from '@mianshitong/db'
import { type ChatRequestMessage } from '../request'

interface ChatSessionRecordId {
  id: string
}

export type ChatMessageCompletionStatus = 'completed' | 'interrupted'

export interface EditableChatMessageRecord {
  completionStatus?: ChatMessageCompletionStatus | null
  content: string
  id: string
  role: 'assistant' | 'user'
}

export interface EditableChatSessionRecord extends ChatSessionRecordId {
  messages: EditableChatMessageRecord[]
  modelId: string
}

interface ChatPrismaTransactionClient {
  chatMessage: {
    create(args: {
      data: {
        completionStatus?: ChatMessageCompletionStatus
        content: string
        role: 'assistant' | 'user'
        sessionId: string
      }
    }): Promise<unknown>
    deleteMany(args: {
      where: {
        id: {
          in: string[]
        }
      }
    }): Promise<{ count: number }>
    findMany(args: {
      where: {
        sessionId: string
      }
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
      select: {
        content: true
        id?: true
        role: true
      }
    }): Promise<ChatRequestMessage[]>
    update(args: {
      where: {
        id: string
      }
      data: {
        content: string
      }
    }): Promise<unknown>
  }
  chatSession: {
    update(args: {
      where: {
        id: string
      }
      data: {
        modelId?: string
        preview: string
        title?: string
      }
    }): Promise<unknown>
  }
}

interface ChatPrismaClient {
  chatSession: {
    create(args: {
      data: {
        actorId: string
        id?: string
        modelId: string
        preview: string
        title: string
        userId?: string
      }
      select: {
        id: true
      }
    }): Promise<ChatSessionRecordId>
    findFirst(args: {
      where: {
        actorId: string
        id: string
      }
      select: Record<string, unknown>
    }): Promise<ChatSessionRecordId | EditableChatSessionRecord | null>
  }
  $transaction<T>(
    fn: (tx: ChatPrismaTransactionClient) => Promise<T>
  ): Promise<T>
}

export const chatPrisma = prisma as unknown as ChatPrismaClient

export function createChatSessionTitle(input: string) {
  return input.trim().slice(0, 18) || '新的面试对话'
}

function normalizeComparableMessageContent(content: string) {
  return content.trim()
}

export function isSameAssistantReply(
  message: EditableChatMessageRecord | null | undefined,
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
