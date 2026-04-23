import { prisma, resolveUserActorDailyModelQuota } from '@mianshitong/db'
import 'server-only'

import {
  type Pagination,
  type SortOrder,
  createPaginatedQuery,
  createPagination,
  formatDateTime,
  normalizePageSize,
  parsePage,
  parseSearchText,
} from '@/server/shared/query'

type AdminUserSortBy = 'createdAt' | 'email' | 'sessionCount'
const MAX_DAILY_MODEL_QUOTA = 100_000
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export interface AdminUserListItem {
  createdAtLabel: string
  dailyModelQuota: number
  email: string
  id: string
  sessionCount: number
  todayUsedQuota: number
}

export interface AdminUserListQuery {
  page: number
  pageSize: number
  sortBy: AdminUserSortBy
  sortOrder: SortOrder
}

export interface AdminUserListResult {
  items: AdminUserListItem[]
  pagination: Pagination
  query: AdminUserListQuery
}

function createTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 1)

  return {
    end,
    start,
  }
}

function createUserSortOrderBy(input: AdminUserListQuery) {
  if (input.sortBy === 'sessionCount') {
    return {
      chatSessions: {
        _count: input.sortOrder,
      },
    }
  }

  return {
    [input.sortBy]: input.sortOrder,
  }
}

export function parseAdminUserListQuery(
  searchParams: Record<string, string | string[] | undefined>
): AdminUserListQuery {
  const sortBy = parseSearchText(searchParams.sortBy)
  const sortOrder = parseSearchText(searchParams.sortOrder)

  return {
    page: parsePage(searchParams.page),
    pageSize: normalizePageSize(searchParams.pageSize),
    sortBy:
      sortBy === 'email' || sortBy === 'sessionCount' || sortBy === 'createdAt'
        ? sortBy
        : 'createdAt',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
  }
}

export async function listAdminUsers(
  query: AdminUserListQuery
): Promise<AdminUserListResult> {
  const [users, total] = await Promise.all([
    prisma.authUser.findMany({
      orderBy: createUserSortOrderBy(query),
      ...createPaginatedQuery(query),
      select: {
        id: true,
        email: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            dailyModelQuota: true,
          },
        },
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    }),
    prisma.authUser.count(),
  ])
  const todayRange = createTodayRange()
  const actorIds = users
    .map((user) => user.actor?.id ?? null)
    .filter((actorId): actorId is string => Boolean(actorId))
  const todayUsageByActorId = new Map<string, number>()

  if (actorIds.length > 0) {
    const usageRows = await prisma.chatReplyUsage.groupBy({
      by: ['actorId'],
      where: {
        actorId: {
          in: actorIds,
        },
        createdAt: {
          gte: todayRange.start,
          lt: todayRange.end,
        },
      },
      _count: {
        id: true,
      },
    })

    for (const usageRow of usageRows) {
      todayUsageByActorId.set(usageRow.actorId, usageRow._count.id)
    }
  }

  return {
    items: users.map((user) => ({
      id: user.id,
      email: user.email,
      dailyModelQuota: resolveUserActorDailyModelQuota({
        type: 'registered',
        dailyModelQuota: user.actor?.dailyModelQuota,
      }),
      createdAtLabel: formatDateTime(user.createdAt),
      sessionCount: user._count.chatSessions,
      todayUsedQuota: user.actor
        ? (todayUsageByActorId.get(user.actor.id) ?? 0)
        : 0,
    })),
    pagination: createPagination({
      page: query.page,
      pageSize: query.pageSize,
      total,
    }),
    query,
  }
}

function isValidDailyModelQuota(value: number) {
  return (
    Number.isSafeInteger(value) && value >= 0 && value <= MAX_DAILY_MODEL_QUOTA
  )
}

export async function updateRegisteredUserDailyModelQuota(input: {
  dailyModelQuota: number
  userId: string
}) {
  if (!isValidDailyModelQuota(input.dailyModelQuota)) {
    return {
      error: 'invalid_quota' as const,
    }
  }

  const targetUser = await prisma.authUser.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      email: true,
    },
  })

  if (!targetUser) {
    return {
      error: 'not_found' as const,
    }
  }

  const actor = await prisma.userActor.upsert({
    where: {
      authUserId: targetUser.id,
    },
    create: {
      id: targetUser.id,
      type: 'registered',
      displayName: targetUser.email,
      authUserId: targetUser.id,
      dailyModelQuota: input.dailyModelQuota,
    },
    update: {
      type: 'registered',
      displayName: targetUser.email,
      dailyModelQuota: input.dailyModelQuota,
    },
    select: {
      dailyModelQuota: true,
    },
  })

  return {
    error: null,
    dailyModelQuota: resolveUserActorDailyModelQuota({
      type: 'registered',
      dailyModelQuota: actor.dailyModelQuota,
    }),
  }
}

export async function deleteRegisteredUser(input: { userId: string }) {
  const targetUser = await prisma.authUser.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
    },
  })

  if (!targetUser) {
    return {
      error: 'not_found' as const,
    }
  }

  await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    await tx.userActor.deleteMany({
      where: {
        authUserId: input.userId,
      },
    })

    await tx.authUser.delete({
      where: {
        id: input.userId,
      },
    })
  })

  return {
    error: null,
  }
}
