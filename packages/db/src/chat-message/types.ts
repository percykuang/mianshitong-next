export type DbChatMessageRole = 'assistant' | 'user'

export type DbChatMessageCompletionStatus = 'completed' | 'interrupted' | null

export type DbChatMessageFeedback = 'dislike' | 'like' | null

export interface DbChatMessageIdRecord {
  id: string
}

export interface DbChatMessageRecord {
  completionStatus: DbChatMessageCompletionStatus
  content: string
  createdAt: Date
  feedback: DbChatMessageFeedback
  id: string
  role: DbChatMessageRole
}

export interface DbChatConversationMessageRow {
  content: string
  role: DbChatMessageRole
}
