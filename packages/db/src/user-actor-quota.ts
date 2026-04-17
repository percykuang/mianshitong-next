export type UserActorQuotaType = 'guest' | 'registered'

export const USER_ACTOR_DAILY_MODEL_QUOTA = {
  guest: 10,
  registered: 20,
} as const satisfies Record<UserActorQuotaType, number>

export function resolveUserActorDailyModelQuota(input: {
  dailyModelQuota?: null | number
  type: UserActorQuotaType
}) {
  return input.dailyModelQuota ?? USER_ACTOR_DAILY_MODEL_QUOTA[input.type]
}
