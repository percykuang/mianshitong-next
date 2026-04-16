import { prisma } from '@mianshitong/db'

export const SESSION_MESSAGES_ORDER_BY = [
  { createdAt: 'asc' as const },
  { id: 'asc' as const },
]

export const CHAT_MESSAGE_ORDER_BY = SESSION_MESSAGES_ORDER_BY

export const SESSIONS_ORDER_BY = [
  { pinned: 'desc' as const },
  { pinnedAt: 'desc' as const },
  { updatedAt: 'desc' as const },
]

export const SESSION_MESSAGES_INCLUDE = {
  messages: {
    orderBy: SESSION_MESSAGES_ORDER_BY,
  },
}

export const CHAT_SESSION_SUMMARY_SELECT = {
  id: true,
  pinned: true,
  title: true,
}

export const CHAT_MESSAGE_ID_SELECT = {
  id: true,
}

// 仅用于从查询形状推导返回类型，避免手写 Prisma payload 接口。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _findPersistedChatSessionRecord(actorId: string, sessionId: string) {
  return prisma.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    include: SESSION_MESSAGES_INCLUDE,
  })
}

// 仅用于从查询形状推导返回类型，避免手写 Prisma payload 接口。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _findChatSessionSummaryRecord(actorId: string, sessionId: string) {
  return prisma.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: CHAT_SESSION_SUMMARY_SELECT,
  })
}

// 仅用于从查询形状推导返回类型，避免手写 Prisma payload 接口。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _findChatMessageIdRecord(
  actorId: string,
  sessionId: string,
  messageId: string
) {
  return prisma.chatMessage.findFirst({
    where: {
      id: messageId,
      sessionId,
      session: {
        actorId,
      },
    },
    select: CHAT_MESSAGE_ID_SELECT,
  })
}

export type PersistedChatSessionWithMessages = NonNullable<
  Awaited<ReturnType<typeof _findPersistedChatSessionRecord>>
>

export type PersistedChatMessage =
  PersistedChatSessionWithMessages['messages'][number]

export type ChatSessionSummary = NonNullable<
  Awaited<ReturnType<typeof _findChatSessionSummaryRecord>>
>

export type ChatMessageIdRecord = NonNullable<
  Awaited<ReturnType<typeof _findChatMessageIdRecord>>
>
