import type { DbClient } from '../client-types'
import type {
  DbUserActorIdentity,
  DbUserActorQuotaRecord,
  DbUserActorUsageCount,
} from './types'

function findUserActorByAuthUserId(client: DbClient, userId: string) {
  return client.userActor.findUnique({
    where: {
      authUserId: userId,
    },
  })
}

function findUserActorByGuestTokenHash(client: DbClient, tokenHash: string) {
  return client.userActor.findUnique({
    where: {
      guestTokenHash: tokenHash,
    },
  })
}

function findUserActorIdentityById(client: DbClient, actorId: string) {
  return client.userActor.findUnique({
    where: {
      id: actorId,
    },
    select: {
      id: true,
      type: true,
      displayName: true,
      authUserId: true,
    },
  }) as Promise<DbUserActorIdentity | null>
}

function findUserActorQuotaRecordById(client: DbClient, actorId: string) {
  return client.userActor.findUnique({
    where: {
      id: actorId,
    },
    select: {
      dailyModelQuota: true,
      type: true,
    },
  }) as Promise<DbUserActorQuotaRecord | null>
}

function createRegisteredUserActor(
  client: DbClient,
  input: {
    authUserId: string
    displayName: string
    id: string
    lastSeenAt: Date
  }
) {
  return client.userActor.create({
    data: {
      id: input.id,
      type: 'registered',
      displayName: input.displayName,
      authUserId: input.authUserId,
      lastSeenAt: input.lastSeenAt,
    },
  })
}

function updateRegisteredUserActor(
  client: DbClient,
  input: {
    displayName: string
    id: string
    lastSeenAt: Date
  }
) {
  return client.userActor.update({
    where: {
      id: input.id,
    },
    data: {
      type: 'registered',
      displayName: input.displayName,
      lastSeenAt: input.lastSeenAt,
    },
  })
}

function createGuestUserActor(
  client: DbClient,
  input: {
    displayName: string
    guestTokenHash: string
    lastSeenAt: Date
  }
) {
  return client.userActor.create({
    data: {
      type: 'guest',
      displayName: input.displayName,
      guestTokenHash: input.guestTokenHash,
      lastSeenAt: input.lastSeenAt,
    },
  })
}

function updateUserActorLastSeen(
  client: DbClient,
  input: {
    actorId: string
    lastSeenAt: Date
  }
) {
  return client.userActor.update({
    where: {
      id: input.actorId,
    },
    data: {
      lastSeenAt: input.lastSeenAt,
    },
  })
}

function countChatReplyUsageByActorInRange(
  client: DbClient,
  input: {
    actorId: string
    end: Date
    start: Date
  }
) {
  return client.chatReplyUsage.count({
    where: {
      actorId: input.actorId,
      createdAt: {
        gte: input.start,
        lt: input.end,
      },
    },
  })
}

async function listChatReplyUsageCountsByActorInRange(
  client: DbClient,
  input: {
    actorIds: string[]
    end: Date
    start: Date
  }
): Promise<DbUserActorUsageCount[]> {
  if (input.actorIds.length === 0) {
    return []
  }

  const usageRows = await client.chatReplyUsage.groupBy({
    by: ['actorId'],
    where: {
      actorId: {
        in: input.actorIds,
      },
      createdAt: {
        gte: input.start,
        lt: input.end,
      },
    },
    _count: {
      id: true,
    },
  })

  return usageRows.map((usageRow) => ({
    actorId: usageRow.actorId,
    count: usageRow._count.id,
  }))
}

async function upsertRegisteredUserActorQuota(
  client: DbClient,
  input: {
    authUserId: string
    dailyModelQuota: number
    displayName: string
  }
) {
  const actor = await client.userActor.upsert({
    where: {
      authUserId: input.authUserId,
    },
    create: {
      id: input.authUserId,
      type: 'registered',
      displayName: input.displayName,
      authUserId: input.authUserId,
      dailyModelQuota: input.dailyModelQuota,
    },
    update: {
      type: 'registered',
      displayName: input.displayName,
      dailyModelQuota: input.dailyModelQuota,
    },
    select: {
      dailyModelQuota: true,
    },
  })

  return actor.dailyModelQuota
}

async function createReplyUsage(
  client: DbClient,
  input: {
    actorId: string
    assistantMessageId: string
  }
) {
  await client.chatReplyUsage.create({
    data: {
      actorId: input.actorId,
      assistantMessageId: input.assistantMessageId,
    },
  })
}

export function createUserActorRepository(client: DbClient) {
  return {
    findByAuthUserId(userId: string) {
      return findUserActorByAuthUserId(client, userId)
    },
    findByGuestTokenHash(tokenHash: string) {
      return findUserActorByGuestTokenHash(client, tokenHash)
    },
    findIdentityById(actorId: string) {
      return findUserActorIdentityById(client, actorId)
    },
    findQuotaById(actorId: string) {
      return findUserActorQuotaRecordById(client, actorId)
    },
    createRegistered(input: {
      authUserId: string
      displayName: string
      id: string
      lastSeenAt: Date
    }) {
      return createRegisteredUserActor(client, input)
    },
    updateRegistered(input: {
      displayName: string
      id: string
      lastSeenAt: Date
    }) {
      return updateRegisteredUserActor(client, input)
    },
    createGuest(input: {
      displayName: string
      guestTokenHash: string
      lastSeenAt: Date
    }) {
      return createGuestUserActor(client, input)
    },
    updateLastSeen(input: { actorId: string; lastSeenAt: Date }) {
      return updateUserActorLastSeen(client, input)
    },
    countReplyUsageInRange(input: { actorId: string; end: Date; start: Date }) {
      return countChatReplyUsageByActorInRange(client, input)
    },
    listReplyUsageCountsInRange(input: {
      actorIds: string[]
      end: Date
      start: Date
    }) {
      return listChatReplyUsageCountsByActorInRange(client, input)
    },
    upsertRegisteredQuota(input: {
      authUserId: string
      dailyModelQuota: number
      displayName: string
    }) {
      return upsertRegisteredUserActorQuota(client, input)
    },
    createReplyUsage(input: { actorId: string; assistantMessageId: string }) {
      return createReplyUsage(client, input)
    },
  }
}

export type UserActorRepository = ReturnType<typeof createUserActorRepository>
