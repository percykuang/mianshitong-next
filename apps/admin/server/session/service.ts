import 'server-only'
import { prisma } from '@mianshitong/db'
import {
  buildDateRangeWhere,
  createPaginatedQuery,
  createPagination,
  formatDateTime,
  normalizeDateInput,
  normalizePageSize,
  parsePage,
  parseSearchText,
  type Pagination,
  type SortOrder,
} from '@/server/shared/query'

type ChatMessageRole = 'assistant' | 'user'
type UserActorType = 'guest' | 'registered'
type AdminSessionSortBy = 'createdAt' | 'messageCount' | 'title' | 'updatedAt'

export type AdminSessionStatus = 'completed' | 'interrupted' | 'pending'

export interface AdminSessionListItem {
  createdAtLabel: string
  id: string
  messageCount: number
  status: AdminSessionStatus
  title: string
  updatedAtLabel: string
  userEmail: string | null
  userId: string
  userLabel: string
  userType: UserActorType
}

export interface AdminSessionFilters {
  createdFrom: string
  createdTo: string
  page: number
  pageSize: number
  query: string
  sortBy: AdminSessionSortBy
  sortOrder: SortOrder
  updatedFrom: string
  updatedTo: string
  userEmail: string
  userId: string
  userType: 'all' | UserActorType
}

export interface AdminSessionListResult {
  items: AdminSessionListItem[]
  pagination: Pagination
  filters: AdminSessionFilters
}

export interface AdminSessionMessageDetail {
  completionStatus: 'completed' | 'interrupted' | null
  content: string
  createdAtLabel: string
  feedback: 'dislike' | 'like' | null
  id: string
  role: ChatMessageRole
}

export interface AdminSessionDetail {
  createdAtLabel: string
  id: string
  messageCount: number
  messages: AdminSessionMessageDetail[]
  status: AdminSessionStatus
  title: string
  updatedAtLabel: string
  userEmail: string | null
  userId: string
  userType: UserActorType
}

function getSessionStatus(input: {
  completionStatus: 'completed' | 'interrupted' | null
  role: ChatMessageRole | null
}): AdminSessionStatus {
  if (input.role === 'user') {
    return 'pending'
  }

  if (input.completionStatus === 'interrupted') {
    return 'interrupted'
  }

  return 'completed'
}

function createSessionSortOrderBy(input: AdminSessionFilters) {
  if (input.sortBy === 'messageCount') {
    return {
      messages: {
        _count: input.sortOrder,
      },
    }
  }

  return {
    [input.sortBy]: input.sortOrder,
  }
}

function buildAdminSessionWhere(filters: AdminSessionFilters) {
  const createdAtWhere = buildDateRangeWhere({
    from: filters.createdFrom,
    to: filters.createdTo,
  })
  const updatedAtWhere = buildDateRangeWhere({
    from: filters.updatedFrom,
    to: filters.updatedTo,
  })

  return {
    ...(filters.query
      ? {
          title: {
            contains: filters.query,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(filters.userId
      ? {
          actorId: {
            contains: filters.userId,
          },
        }
      : {}),
    ...(filters.userType !== 'all' || filters.userEmail
      ? {
          actor: {
            ...(filters.userType !== 'all'
              ? {
                  type: filters.userType,
                }
              : {}),
            ...(filters.userEmail
              ? {
                  authUser: {
                    is: {
                      email: {
                        contains: filters.userEmail,
                        mode: 'insensitive' as const,
                      },
                    },
                  },
                }
              : {}),
          },
        }
      : {}),
    ...(createdAtWhere ? { createdAt: createdAtWhere } : {}),
    ...(updatedAtWhere ? { updatedAt: updatedAtWhere } : {}),
  }
}

function toAdminSessionListItem(session: {
  _count: { messages: number }
  actor: {
    authUser: {
      email: string
    } | null
    displayName: string
    type: UserActorType
  }
  actorId: string
  createdAt: Date
  id: string
  messages: Array<{
    completionStatus: 'completed' | 'interrupted' | null
    role: ChatMessageRole
  }>
  title: string
  updatedAt: Date
}): AdminSessionListItem {
  const latestMessage = session.messages[0]

  return {
    id: session.id,
    userId: session.actorId,
    userEmail: session.actor.authUser?.email ?? null,
    userLabel: session.actor.displayName,
    userType: session.actor.type,
    title: session.title,
    messageCount: session._count.messages,
    status: getSessionStatus({
      role: latestMessage?.role ?? null,
      completionStatus: latestMessage?.completionStatus ?? null,
    }),
    createdAtLabel: formatDateTime(session.createdAt),
    updatedAtLabel: formatDateTime(session.updatedAt),
  }
}

export function parseAdminSessionFilters(
  searchParams: Record<string, string | string[] | undefined>
): AdminSessionFilters {
  const userType = parseSearchText(searchParams.userType)
  const sortBy = parseSearchText(searchParams.sortBy)
  const sortOrder = parseSearchText(searchParams.sortOrder)

  return {
    page: parsePage(searchParams.page),
    pageSize: normalizePageSize(searchParams.pageSize),
    query: parseSearchText(searchParams.query),
    userId: parseSearchText(searchParams.userId),
    userEmail: parseSearchText(searchParams.userEmail),
    userType:
      userType === 'guest' || userType === 'registered' ? userType : 'all',
    createdFrom: normalizeDateInput(searchParams.createdFrom),
    createdTo: normalizeDateInput(searchParams.createdTo),
    updatedFrom: normalizeDateInput(searchParams.updatedFrom),
    updatedTo: normalizeDateInput(searchParams.updatedTo),
    sortBy:
      sortBy === 'createdAt' ||
      sortBy === 'messageCount' ||
      sortBy === 'title' ||
      sortBy === 'updatedAt'
        ? sortBy
        : 'updatedAt',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
  }
}

export async function listAdminSessions(
  filters: AdminSessionFilters
): Promise<AdminSessionListResult> {
  const where = buildAdminSessionWhere(filters)

  const [sessions, total] = await Promise.all([
    prisma.chatSession.findMany({
      where,
      orderBy: createSessionSortOrderBy(filters),
      ...createPaginatedQuery(filters),
      select: {
        id: true,
        actorId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        actor: {
          select: {
            displayName: true,
            type: true,
            authUser: {
              select: {
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: [
            {
              createdAt: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          take: 1,
          select: {
            role: true,
            completionStatus: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
    prisma.chatSession.count({ where }),
  ])

  return {
    items: sessions.map(toAdminSessionListItem),
    pagination: createPagination({
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }),
    filters,
  }
}

export async function getAdminSessionDetail(
  sessionId: string
): Promise<AdminSessionDetail | null> {
  const session = await prisma.chatSession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      actorId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      actor: {
        select: {
          type: true,
          authUser: {
            select: {
              email: true,
            },
          },
        },
      },
      messages: {
        orderBy: [
          {
            createdAt: 'asc',
          },
          {
            id: 'asc',
          },
        ],
        select: {
          id: true,
          role: true,
          content: true,
          feedback: true,
          completionStatus: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  const latestMessage = session.messages.at(-1)

  return {
    id: session.id,
    userId: session.actorId,
    userEmail: session.actor.authUser?.email ?? null,
    userType: session.actor.type,
    title: session.title,
    messageCount: session._count.messages,
    status: getSessionStatus({
      role: latestMessage?.role ?? null,
      completionStatus: latestMessage?.completionStatus ?? null,
    }),
    createdAtLabel: formatDateTime(session.createdAt),
    updatedAtLabel: formatDateTime(session.updatedAt),
    messages: session.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      feedback: message.feedback,
      completionStatus: message.completionStatus,
      createdAtLabel: formatDateTime(message.createdAt),
    })),
  }
}

export async function deleteAdminSession(sessionId: string) {
  const existingSession = await prisma.chatSession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
    },
  })

  if (!existingSession) {
    return false
  }

  await prisma.chatSession.delete({
    where: {
      id: sessionId,
    },
  })

  return true
}
