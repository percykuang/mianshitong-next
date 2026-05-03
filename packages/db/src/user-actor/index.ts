import type { DbClient } from '../client-types'
import {
  USER_ACTOR_DAILY_MODEL_QUOTA,
  resolveUserActorDailyModelQuota,
} from '../user-actor-quota'
import { createUserActorRepository } from './repository'

export function createUserActorDb(client: DbClient) {
  const repository = createUserActorRepository(client)

  return {
    ...repository,
    dailyModelQuotaByType: USER_ACTOR_DAILY_MODEL_QUOTA,
    resolveDailyModelQuota: resolveUserActorDailyModelQuota,
  }
}

export type UserActorDb = ReturnType<typeof createUserActorDb>
export type {
  DbUserActorIdentity,
  DbUserActorQuotaRecord,
  DbUserActorUsageCount,
} from './types'
