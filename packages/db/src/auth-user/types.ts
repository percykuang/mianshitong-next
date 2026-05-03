export interface DbAuthSessionResult {
  expiresAt: Date
  maxAgeSeconds: number
  sessionToken: string
}

export type DbAuthUserAdminSortBy = 'createdAt' | 'email' | 'sessionCount'

export interface DbListAuthUsersForAdminInput {
  skip: number
  sortBy: DbAuthUserAdminSortBy
  sortOrder: 'asc' | 'desc'
  take: number
}

export interface DbAuthUserActorRecord {
  dailyModelQuota: null | number
  id: string
}

export interface DbAdminAuthUserListItemRow {
  actor: DbAuthUserActorRecord | null
  createdAt: Date
  email: string
  id: string
  sessionCount: number
}

export interface DbListAuthUsersForAdminResult {
  items: DbAdminAuthUserListItemRow[]
  total: number
}
