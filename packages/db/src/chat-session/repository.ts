import type { DbClient } from '../client-types'
import type {
  DbAdminChatSessionDetailRow,
  DbChatSessionIdentity,
  DbChatSessionSummary,
  DbChatSessionTitleGenerationContext,
  DbChatSessionTitleSource,
  DbEditableChatSessionRecord,
  DbInterruptedSessionRecord,
  DbListChatSessionsForAdminInput,
  DbListChatSessionsForAdminResult,
  DbPersistedChatSessionWithMessages,
} from './types'

const SESSION_MESSAGES_ORDER_BY = [
  { createdAt: 'asc' as const },
  { id: 'asc' as const },
]

const ADMIN_SESSION_LATEST_MESSAGE_ORDER_BY = [
  { createdAt: 'desc' as const },
  { id: 'desc' as const },
]

const ADMIN_SESSION_ORDER_BY_BY_FIELD = {
  createdAt(sortOrder: 'asc' | 'desc') {
    return {
      createdAt: sortOrder,
    }
  },
  messageCount(sortOrder: 'asc' | 'desc') {
    return {
      messages: {
        _count: sortOrder,
      },
    }
  },
  title(sortOrder: 'asc' | 'desc') {
    return {
      title: sortOrder,
    }
  },
  updatedAt(sortOrder: 'asc' | 'desc') {
    return {
      updatedAt: sortOrder,
    }
  },
} as const

function createDateAtStart(dateText: string) {
  return new Date(`${dateText}T00:00:00`)
}

function createDateAtNextDay(dateText: string) {
  const nextDate = createDateAtStart(dateText)
  nextDate.setDate(nextDate.getDate() + 1)
  return nextDate
}

function buildDateRangeWhere(input: { from: string; to: string }) {
  const where: {
    gte?: Date
    lt?: Date
  } = {}

  if (input.from) {
    where.gte = createDateAtStart(input.from)
  }

  if (input.to) {
    where.lt = createDateAtNextDay(input.to)
  }

  return Object.keys(where).length > 0 ? where : undefined
}

function getActorSessionWhere(actorId: string, sessionId: string) {
  return {
    id: sessionId,
    actorId,
  }
}

function getActorNonEmptySessionWhere(actorId: string, sessionId: string) {
  return {
    ...getActorSessionWhere(actorId, sessionId),
    messages: {
      some: {},
    },
  }
}

function buildAdminSessionWhere(
  filters: Omit<
    DbListChatSessionsForAdminInput,
    'skip' | 'sortBy' | 'sortOrder' | 'take'
  >
) {
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

function createAdminSessionOrderBy(input: DbListChatSessionsForAdminInput) {
  return ADMIN_SESSION_ORDER_BY_BY_FIELD[input.sortBy](input.sortOrder)
}

function listByActor(
  client: DbClient,
  actorId: string
): Promise<DbPersistedChatSessionWithMessages[]> {
  return client.chatSession.findMany({
    where: {
      actorId,
      messages: {
        some: {},
      },
    },
    include: {
      messages: {
        orderBy: SESSION_MESSAGES_ORDER_BY,
      },
    },
    orderBy: [{ pinned: 'desc' }, { pinnedAt: 'desc' }, { updatedAt: 'desc' }],
  })
}

function findByActor(
  client: DbClient,
  actorId: string,
  sessionId: string
): Promise<DbPersistedChatSessionWithMessages | null> {
  return client.chatSession.findFirst({
    where: getActorNonEmptySessionWhere(actorId, sessionId),
    include: {
      messages: {
        orderBy: SESSION_MESSAGES_ORDER_BY,
      },
    },
  })
}

function findSummaryByActor(
  client: DbClient,
  actorId: string,
  sessionId: string
): Promise<DbChatSessionSummary | null> {
  return client.chatSession.findFirst({
    where: getActorSessionWhere(actorId, sessionId),
    select: {
      id: true,
      pinned: true,
      title: true,
    },
  })
}

function create(
  client: DbClient,
  input: {
    actorId: string
    id?: string
    modelId: string
    preview: string
    title: string
    titleSource: DbChatSessionTitleSource
    userId?: string | null
  }
): Promise<DbPersistedChatSessionWithMessages> {
  return client.chatSession.create({
    data: {
      actorId: input.actorId,
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.id ? { id: input.id } : {}),
      modelId: input.modelId,
      preview: input.preview,
      title: input.title,
      titleSource: input.titleSource,
    },
    include: {
      messages: {
        orderBy: SESSION_MESSAGES_ORDER_BY,
      },
    },
  })
}

async function updateById(
  client: DbClient,
  input: {
    pinned?: boolean
    pinnedAt?: Date | null
    preview?: string
    sessionId: string
    title?: string
    titleSource?: DbChatSessionTitleSource
    modelId?: string
  }
) {
  await client.chatSession.update({
    where: {
      id: input.sessionId,
    },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.titleSource !== undefined
        ? { titleSource: input.titleSource }
        : {}),
      ...(input.preview !== undefined ? { preview: input.preview } : {}),
      ...(input.modelId !== undefined ? { modelId: input.modelId } : {}),
      ...(input.pinned !== undefined ? { pinned: input.pinned } : {}),
      ...(input.pinnedAt !== undefined ? { pinnedAt: input.pinnedAt } : {}),
    },
  })
}

function deleteByActor(client: DbClient, actorId: string, sessionId: string) {
  return client.chatSession.deleteMany({
    where: getActorSessionWhere(actorId, sessionId),
  })
}

function deleteAllByActor(client: DbClient, actorId: string) {
  return client.chatSession.deleteMany({
    where: {
      actorId,
    },
  })
}

function findTitleGenerationContextByActor(
  client: DbClient,
  input: {
    actorId: string
    fallbackTitle: string
    sessionId: string
  }
): Promise<DbChatSessionTitleGenerationContext | null> {
  return client.chatSession.findFirst({
    where: {
      ...getActorSessionWhere(input.actorId, input.sessionId),
      title: input.fallbackTitle,
      titleSource: 'fallback',
      messages: {
        some: {
          role: 'assistant',
          completionStatus: 'completed',
        },
      },
    },
    select: {
      id: true,
      modelId: true,
      messages: {
        orderBy: SESSION_MESSAGES_ORDER_BY,
        select: {
          role: true,
          content: true,
          completionStatus: true,
        },
        take: 6,
      },
    },
  })
}

function updateGeneratedTitleByActor(
  client: DbClient,
  input: {
    actorId: string
    fallbackTitle: string
    sessionId: string
    title: string
  }
) {
  return client.chatSession.updateMany({
    where: {
      ...getActorSessionWhere(input.actorId, input.sessionId),
      title: input.fallbackTitle,
      titleSource: 'fallback',
    },
    data: {
      title: input.title,
      titleSource: 'ai',
    },
  })
}

function findIdentityById(
  client: DbClient,
  sessionId: string
): Promise<DbChatSessionIdentity | null> {
  return client.chatSession.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      actorId: true,
      id: true,
    },
  })
}

function findInterruptedByActor(
  client: DbClient,
  actorId: string,
  sessionId: string
): Promise<DbInterruptedSessionRecord | null> {
  return client.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: {
      id: true,
      messages: {
        orderBy: SESSION_MESSAGES_ORDER_BY,
        select: {
          completionStatus: true,
          id: true,
          role: true,
          content: true,
        },
      },
    },
  })
}

function findEditableByActor(
  client: DbClient,
  actorId: string,
  sessionId: string
): Promise<DbEditableChatSessionRecord | null> {
  return client.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: {
      id: true,
      modelId: true,
      messages: {
        orderBy: SESSION_MESSAGES_ORDER_BY,
        select: {
          id: true,
          role: true,
          content: true,
        },
      },
    },
  })
}

async function listForAdmin(
  client: DbClient,
  input: DbListChatSessionsForAdminInput
): Promise<DbListChatSessionsForAdminResult> {
  const where = buildAdminSessionWhere(input)
  const [sessions, total] = await Promise.all([
    client.chatSession.findMany({
      where,
      orderBy: createAdminSessionOrderBy(input),
      skip: input.skip,
      take: input.take,
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
          orderBy: ADMIN_SESSION_LATEST_MESSAGE_ORDER_BY,
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
    client.chatSession.count({ where }),
  ])

  return {
    items: sessions.map((session) => ({
      id: session.id,
      actorId: session.actorId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      actor: session.actor,
      messages: session.messages,
      messageCount: session._count.messages,
    })),
    total,
  }
}

function findAdminDetailById(
  client: DbClient,
  sessionId: string
): Promise<DbAdminChatSessionDetailRow | null> {
  return client.chatSession
    .findUnique({
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
          orderBy: SESSION_MESSAGES_ORDER_BY,
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
    .then((session) =>
      session
        ? {
            id: session.id,
            actorId: session.actorId,
            title: session.title,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            actor: session.actor,
            messages: session.messages,
            messageCount: session._count.messages,
          }
        : null
    )
}

async function deleteById(client: DbClient, sessionId: string) {
  await client.chatSession.delete({
    where: {
      id: sessionId,
    },
  })
}

export function createChatSessionDb(client: DbClient) {
  return {
    listByActor(actorId: string) {
      return listByActor(client, actorId)
    },
    findByActor(actorId: string, sessionId: string) {
      return findByActor(client, actorId, sessionId)
    },
    findSummaryByActor(actorId: string, sessionId: string) {
      return findSummaryByActor(client, actorId, sessionId)
    },
    create(input: {
      actorId: string
      id?: string
      modelId: string
      preview: string
      title: string
      titleSource: DbChatSessionTitleSource
      userId?: string | null
    }) {
      return create(client, input)
    },
    updateById(input: {
      pinned?: boolean
      pinnedAt?: Date | null
      preview?: string
      sessionId: string
      title?: string
      titleSource?: DbChatSessionTitleSource
      modelId?: string
    }) {
      return updateById(client, input)
    },
    deleteByActor(actorId: string, sessionId: string) {
      return deleteByActor(client, actorId, sessionId)
    },
    deleteAllByActor(actorId: string) {
      return deleteAllByActor(client, actorId)
    },
    findTitleGenerationContextByActor(input: {
      actorId: string
      fallbackTitle: string
      sessionId: string
    }) {
      return findTitleGenerationContextByActor(client, input)
    },
    updateGeneratedTitleByActor(input: {
      actorId: string
      fallbackTitle: string
      sessionId: string
      title: string
    }) {
      return updateGeneratedTitleByActor(client, input)
    },
    findIdentityById(sessionId: string) {
      return findIdentityById(client, sessionId)
    },
    findInterruptedByActor(actorId: string, sessionId: string) {
      return findInterruptedByActor(client, actorId, sessionId)
    },
    findEditableByActor(actorId: string, sessionId: string) {
      return findEditableByActor(client, actorId, sessionId)
    },
    listForAdmin(input: DbListChatSessionsForAdminInput) {
      return listForAdmin(client, input)
    },
    findAdminDetailById(sessionId: string) {
      return findAdminDetailById(client, sessionId)
    },
    deleteById(sessionId: string) {
      return deleteById(client, sessionId)
    },
  }
}

export type ChatSessionDb = ReturnType<typeof createChatSessionDb>
