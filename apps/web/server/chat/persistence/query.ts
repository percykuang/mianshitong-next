import { prisma } from '@mianshitong/db'
import { CHAT_MESSAGE_ORDER_BY } from '../session'

export { CHAT_MESSAGE_ORDER_BY }

const INTERRUPT_MESSAGE_SELECT = {
  completionStatus: true,
  id: true,
  role: true,
  content: true,
}

const INTERRUPT_SESSION_SELECT = {
  id: true,
  messages: {
    orderBy: CHAT_MESSAGE_ORDER_BY,
    select: INTERRUPT_MESSAGE_SELECT,
  },
}

const EDITABLE_MESSAGE_SELECT = {
  id: true,
  role: true,
  content: true,
}

const EDITABLE_SESSION_SELECT = {
  id: true,
  modelId: true,
  messages: {
    orderBy: CHAT_MESSAGE_ORDER_BY,
    select: EDITABLE_MESSAGE_SELECT,
  },
}

// 仅用于从查询形状推导返回类型，避免手写 Prisma payload 接口。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _findInterruptedSessionRecord(actorId: string, sessionId: string) {
  return prisma.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: INTERRUPT_SESSION_SELECT,
  })
}

// 仅用于从查询形状推导返回类型，避免手写 Prisma payload 接口。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _findEditableSessionRecord(actorId: string, sessionId: string) {
  return prisma.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: EDITABLE_SESSION_SELECT,
  })
}

export function findInterruptedSessionRecord(
  actorId: string,
  sessionId: string
) {
  return prisma.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: INTERRUPT_SESSION_SELECT,
  })
}

export function findEditableSessionRecord(actorId: string, sessionId: string) {
  return prisma.chatSession.findFirst({
    where: {
      actorId,
      id: sessionId,
    },
    select: EDITABLE_SESSION_SELECT,
  })
}

export type InterruptedSessionRecord = NonNullable<
  Awaited<ReturnType<typeof _findInterruptedSessionRecord>>
>

export type EditableChatSessionRecord = NonNullable<
  Awaited<ReturnType<typeof _findEditableSessionRecord>>
>
