import { db } from '@mianshitong/db'

import { CHAT_MESSAGE_ORDER_BY } from '../session/query'

export { CHAT_MESSAGE_ORDER_BY }

export function findInterruptedSessionRecord(
  actorId: string,
  sessionId: string
) {
  return db.chatSession.findInterruptedByActor(actorId, sessionId)
}

export function findEditableSessionRecord(actorId: string, sessionId: string) {
  return db.chatSession.findEditableByActor(actorId, sessionId)
}

export type InterruptedSessionRecord = NonNullable<
  Awaited<ReturnType<typeof findInterruptedSessionRecord>>
>

export type EditableChatSessionRecord = NonNullable<
  Awaited<ReturnType<typeof findEditableSessionRecord>>
>
