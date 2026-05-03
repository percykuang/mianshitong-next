import type { UserActorQuotaType } from '../user-actor-quota'

export interface DbUserActorIdentity {
  authUserId: string | null
  displayName: string
  id: string
  type: UserActorQuotaType
}

export interface DbUserActorQuotaRecord {
  dailyModelQuota: number | null
  type: UserActorQuotaType
}

export interface DbUserActorUsageCount {
  actorId: string
  count: number
}
