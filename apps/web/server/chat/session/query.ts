export type {
  DbChatMessageIdRecord as ChatMessageIdRecord,
  DbChatSessionSummary as ChatSessionSummary,
  DbPersistedChatMessage as PersistedChatMessage,
  DbPersistedChatSessionWithMessages as PersistedChatSessionWithMessages,
} from '@mianshitong/db'

export const SESSION_MESSAGES_ORDER_BY = [
  { createdAt: 'asc' as const },
  { id: 'asc' as const },
]

export const CHAT_MESSAGE_ORDER_BY = SESSION_MESSAGES_ORDER_BY
