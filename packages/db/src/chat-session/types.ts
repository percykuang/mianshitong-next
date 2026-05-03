import type {
  DbChatMessageCompletionStatus,
  DbChatMessageFeedback,
  DbChatMessageRole,
} from '../chat-message'

export type DbChatSessionTitleSource = 'ai' | 'fallback' | 'manual'

export interface DbPersistedChatMessage {
  completionStatus: DbChatMessageCompletionStatus
  content: string
  createdAt: Date
  feedback: DbChatMessageFeedback
  id: string
  role: DbChatMessageRole
}

export interface DbPersistedChatSessionWithMessages {
  createdAt: Date
  id: string
  messages: DbPersistedChatMessage[]
  pinned: boolean
  pinnedAt: Date | null
  preview: string
  title: string
  updatedAt: Date
}

export interface DbChatSessionSummary {
  id: string
  pinned: boolean
  title: string
}

export interface DbChatSessionTitleContextMessage {
  completionStatus: DbChatMessageCompletionStatus
  content: string
  role: DbChatMessageRole
}

export interface DbChatSessionTitleGenerationContext {
  id: string
  messages: DbChatSessionTitleContextMessage[]
  modelId: string
}

export interface DbInterruptedSessionMessageRecord {
  completionStatus: DbChatMessageCompletionStatus
  content: string
  id: string
  role: DbChatMessageRole
}

export interface DbInterruptedSessionRecord {
  id: string
  messages: DbInterruptedSessionMessageRecord[]
}

export interface DbEditableChatSessionMessageRecord {
  content: string
  id: string
  role: DbChatMessageRole
}

export interface DbEditableChatSessionRecord {
  id: string
  messages: DbEditableChatSessionMessageRecord[]
  modelId: string
}

export interface DbChatSessionIdentity {
  actorId: string
  id: string
}

export type DbAdminChatSessionUserType = 'guest' | 'registered'

export type DbAdminSessionSortBy =
  | 'createdAt'
  | 'messageCount'
  | 'title'
  | 'updatedAt'

export interface DbListChatSessionsForAdminInput {
  createdFrom: string
  createdTo: string
  query: string
  skip: number
  sortBy: DbAdminSessionSortBy
  sortOrder: 'asc' | 'desc'
  take: number
  updatedFrom: string
  updatedTo: string
  userEmail: string
  userId: string
  userType: 'all' | DbAdminChatSessionUserType
}

export interface DbAdminChatSessionListLatestMessage {
  completionStatus: DbChatMessageCompletionStatus
  role: DbChatMessageRole
}

export interface DbAdminChatSessionListRow {
  actor: {
    authUser: {
      email: string
    } | null
    displayName: string
    type: DbAdminChatSessionUserType
  }
  actorId: string
  createdAt: Date
  id: string
  messageCount: number
  messages: DbAdminChatSessionListLatestMessage[]
  title: string
  updatedAt: Date
}

export interface DbListChatSessionsForAdminResult {
  items: DbAdminChatSessionListRow[]
  total: number
}

export interface DbAdminChatSessionDetailMessage {
  completionStatus: DbChatMessageCompletionStatus
  content: string
  createdAt: Date
  feedback: DbChatMessageFeedback
  id: string
  role: DbChatMessageRole
}

export interface DbAdminChatSessionDetailRow {
  actor: {
    authUser: {
      email: string
    } | null
    type: DbAdminChatSessionUserType
  }
  actorId: string
  createdAt: Date
  id: string
  messageCount: number
  messages: DbAdminChatSessionDetailMessage[]
  title: string
  updatedAt: Date
}
