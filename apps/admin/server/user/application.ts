import { db } from '@mianshitong/db'
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
  const { items: users, total } = await db.authUser.listForAdmin({
    ...createPaginatedQuery(query),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  })
  const todayRange = createTodayRange()
  const actorIds = users
    .map((user) => user.actor?.id ?? null)
    .filter((actorId): actorId is string => Boolean(actorId))
  const usageRows = await db.userActor.listReplyUsageCountsInRange({
    actorIds,
    start: todayRange.start,
    end: todayRange.end,
  })
  const todayUsageByActorId = new Map(
    usageRows.map((usageRow) => [usageRow.actorId, usageRow.count])
  )

  return {
    items: users.map((user) => ({
      id: user.id,
      email: user.email,
      dailyModelQuota: db.userActor.resolveDailyModelQuota({
        type: 'registered',
        dailyModelQuota: user.actor?.dailyModelQuota,
      }),
      createdAtLabel: formatDateTime(user.createdAt),
      sessionCount: user.sessionCount,
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

  const targetUser = await db.authUser.findById(input.userId)

  if (!targetUser) {
    return {
      error: 'not_found' as const,
    }
  }

  const dailyModelQuota = await db.userActor.upsertRegisteredQuota({
    authUserId: targetUser.id,
    displayName: targetUser.email,
    dailyModelQuota: input.dailyModelQuota,
  })

  return {
    error: null,
    dailyModelQuota: db.userActor.resolveDailyModelQuota({
      type: 'registered',
      dailyModelQuota,
    }),
  }
}

export async function deleteRegisteredUser(input: { userId: string }) {
  const targetUser = await db.authUser.findById(input.userId)

  if (!targetUser) {
    return {
      error: 'not_found' as const,
    }
  }

  await db.authUser.deleteWithActorById(input.userId)

  return {
    error: null,
  }
}
