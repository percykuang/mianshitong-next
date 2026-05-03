import {
  type AdminUserDb,
  type DbAdminSessionResult,
  createAdminUserDb,
} from './admin-user'
import {
  type AuthUserDb,
  type DbAdminAuthUserListItemRow,
  type DbAuthSessionResult,
  type DbAuthUserAdminSortBy,
  type DbListAuthUsersForAdminInput,
  type DbListAuthUsersForAdminResult,
  createAuthUserDb,
} from './auth-user'
import { type CareerThreadDb, createCareerThreadDb } from './career-thread'
import type {
  DbCareerThreadStateRecord,
  DbUpsertCareerThreadStateInput,
} from './career-thread'
import {
  type ChatMessageDb,
  type DbChatConversationMessageRow,
  type DbChatMessageCompletionStatus,
  type DbChatMessageFeedback,
  type DbChatMessageIdRecord,
  type DbChatMessageRecord,
  type DbChatMessageRole,
  createChatMessageDb,
} from './chat-message'
import {
  type ChatModelConfigDb,
  type DbChatModelConfigCreateInput,
  type DbChatModelConfigMetaRow,
  type DbChatModelConfigProvider,
  type DbChatModelConfigUpdateInput,
  type DbStoredChatModelConfigRow,
  type DbStoredEnabledChatModelConfigRow,
  createChatModelConfigDb,
} from './chat-model-config'
import {
  type ChatSessionDb,
  type DbAdminChatSessionDetailRow,
  type DbAdminChatSessionListRow,
  type DbAdminChatSessionUserType,
  type DbAdminSessionSortBy,
  type DbChatSessionIdentity,
  type DbChatSessionSummary,
  type DbChatSessionTitleGenerationContext,
  type DbChatSessionTitleSource,
  type DbEditableChatSessionRecord,
  type DbInterruptedSessionRecord,
  type DbListChatSessionsForAdminInput,
  type DbListChatSessionsForAdminResult,
  type DbPersistedChatMessage,
  type DbPersistedChatSessionWithMessages,
  createChatSessionDb,
} from './chat-session'
import { prisma } from './client'
import type { DbClient, PrismaClientInstance } from './client-types'
import {
  type DbUserActorIdentity,
  type DbUserActorQuotaRecord,
  type DbUserActorUsageCount,
  type UserActorDb,
  createUserActorDb,
} from './user-actor'
import type { UserActorQuotaType } from './user-actor-quota'

export type { AdminUserDb, DbAdminSessionResult }
export type {
  AuthUserDb,
  DbAdminAuthUserListItemRow,
  DbAuthSessionResult,
  DbAuthUserAdminSortBy,
  DbListAuthUsersForAdminInput,
  DbListAuthUsersForAdminResult,
}
export type {
  CareerThreadDb,
  DbCareerThreadStateRecord,
  DbUpsertCareerThreadStateInput,
}
export type {
  ChatMessageDb,
  DbChatConversationMessageRow,
  DbChatMessageCompletionStatus,
  DbChatMessageFeedback,
  DbChatMessageIdRecord,
  DbChatMessageRecord,
  DbChatMessageRole,
}
export type {
  ChatModelConfigDb,
  DbChatModelConfigCreateInput,
  DbChatModelConfigMetaRow,
  DbChatModelConfigProvider,
  DbChatModelConfigUpdateInput,
  DbStoredChatModelConfigRow,
  DbStoredEnabledChatModelConfigRow,
}
export type {
  ChatSessionDb,
  DbAdminChatSessionDetailRow,
  DbAdminChatSessionListRow,
  DbAdminChatSessionUserType,
  DbAdminSessionSortBy,
  DbChatSessionIdentity,
  DbChatSessionSummary,
  DbChatSessionTitleGenerationContext,
  DbChatSessionTitleSource,
  DbEditableChatSessionRecord,
  DbInterruptedSessionRecord,
  DbListChatSessionsForAdminInput,
  DbListChatSessionsForAdminResult,
  DbPersistedChatMessage,
  DbPersistedChatSessionWithMessages,
}
export type {
  DbUserActorIdentity,
  DbUserActorQuotaRecord,
  DbUserActorUsageCount,
  UserActorDb,
  UserActorQuotaType,
}

interface DbRepositories {
  adminUser: AdminUserDb
  authUser: AuthUserDb
  careerThread: CareerThreadDb
  chatMessage: ChatMessageDb
  chatModelConfig: ChatModelConfigDb
  chatSession: ChatSessionDb
  userActor: UserActorDb
}

export type DbTransaction = DbRepositories

export interface Db extends DbRepositories {
  transaction<T>(handler: (tx: DbTransaction) => Promise<T>): Promise<T>
}

function createDbRepositories(client: DbClient): DbRepositories {
  return {
    adminUser: createAdminUserDb(client),
    authUser: createAuthUserDb(client),
    careerThread: createCareerThreadDb(client),
    chatMessage: createChatMessageDb(client),
    chatModelConfig: createChatModelConfigDb(client),
    chatSession: createChatSessionDb(client),
    userActor: createUserActorDb(client),
  }
}

function createDb(client: PrismaClientInstance): Db {
  return {
    ...createDbRepositories(client),
    transaction<T>(handler: (tx: DbTransaction) => Promise<T>) {
      return client.$transaction((transactionClient) =>
        handler(createDbRepositories(transactionClient))
      )
    },
  }
}

export const db = createDb(prisma)
