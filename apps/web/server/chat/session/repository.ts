import { prisma } from '@mianshitong/db'

import type { ChatSessionPreview } from '@/app/chat/domain'

import { toChatSessionPreview } from './presenter'
import {
  CHAT_MESSAGE_ID_SELECT,
  CHAT_SESSION_SUMMARY_SELECT,
  type ChatMessageIdRecord,
  type ChatSessionSummary,
  type PersistedChatSessionWithMessages,
  SESSIONS_ORDER_BY,
  SESSION_MESSAGES_INCLUDE,
} from './query'

type ChatMessageFeedbackValue = 'dislike' | 'like' | null

function normalizeSessionTitle(title: string | undefined) {
  const normalizedTitle = title?.trim() ?? ''
  return normalizedTitle ? normalizedTitle.slice(0, 80) : '新的面试对话'
}

function getActorSessionWhere(actorId: string, sessionId: string) {
  return {
    id: sessionId,
    actorId,
  }
}

function toChatSessionPreviews(
  sessions: PersistedChatSessionWithMessages[]
): ChatSessionPreview[] {
  return sessions.map(toChatSessionPreview)
}

async function findPersistedChatSessionByActor(
  actorId: string,
  sessionId: string
): Promise<PersistedChatSessionWithMessages | null> {
  return prisma.chatSession.findFirst({
    where: getActorSessionWhere(actorId, sessionId),
    include: SESSION_MESSAGES_INCLUDE,
  })
}

async function findChatSessionSummaryByActor(
  actorId: string,
  sessionId: string
): Promise<ChatSessionSummary | null> {
  return prisma.chatSession.findFirst({
    where: getActorSessionWhere(actorId, sessionId),
    select: CHAT_SESSION_SUMMARY_SELECT,
  })
}

function buildChatSessionUpdateData(
  currentSession: ChatSessionSummary,
  input: UpdateChatSessionInput
) {
  const nextPinned =
    typeof input.pinned === 'boolean' ? input.pinned : currentSession.pinned

  return {
    ...(typeof input.title === 'string'
      ? { title: normalizeSessionTitle(input.title) }
      : {}),
    ...(typeof input.pinned === 'boolean'
      ? {
          pinned: nextPinned,
          pinnedAt: nextPinned ? new Date() : null,
        }
      : {}),
  }
}

export async function listChatSessionsByActor(actorId: string) {
  const sessions = await prisma.chatSession.findMany({
    where: { actorId },
    include: SESSION_MESSAGES_INCLUDE,
    orderBy: SESSIONS_ORDER_BY,
  })

  return toChatSessionPreviews(sessions)
}

export async function findChatSessionByActor(
  actorId: string,
  sessionId: string
): Promise<ChatSessionPreview | null> {
  const session = await findPersistedChatSessionByActor(actorId, sessionId)

  if (!session) {
    return null
  }

  return toChatSessionPreview(session)
}

interface CreateChatSessionInput {
  actorId: string
  modelId: string
  title?: string
  userId?: string | null
}

export async function createChatSession(input: CreateChatSessionInput) {
  const session = await prisma.chatSession.create({
    data: {
      actorId: input.actorId,
      modelId: input.modelId,
      title: normalizeSessionTitle(input.title),
      preview: '',
      ...(input.userId ? { userId: input.userId } : {}),
    },
    include: SESSION_MESSAGES_INCLUDE,
  })

  return toChatSessionPreview(session)
}

interface UpdateChatSessionInput {
  pinned?: boolean
  title?: string
}

export async function updateChatSessionByActor(
  actorId: string,
  sessionId: string,
  input: UpdateChatSessionInput
): Promise<ChatSessionPreview | null> {
  const currentSession = await findChatSessionSummaryByActor(actorId, sessionId)

  if (!currentSession) {
    return null
  }

  const updatedSession = await prisma.chatSession.update({
    where: {
      id: currentSession.id,
    },
    data: buildChatSessionUpdateData(currentSession, input),
    include: SESSION_MESSAGES_INCLUDE,
  })

  return toChatSessionPreview(updatedSession)
}

export async function deleteChatSessionByActor(
  actorId: string,
  sessionId: string
) {
  const result = await prisma.chatSession.deleteMany({
    where: getActorSessionWhere(actorId, sessionId),
  })

  return result.count > 0
}

export async function deleteAllChatSessionsByActor(actorId: string) {
  const result = await prisma.chatSession.deleteMany({
    where: {
      actorId,
    },
  })

  return result.count
}

export async function updateChatMessageFeedbackByActor(
  actorId: string,
  sessionId: string,
  messageId: string,
  feedback: ChatMessageFeedbackValue
): Promise<ChatSessionPreview | null> {
  const targetMessage: ChatMessageIdRecord | null =
    await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        sessionId,
        session: {
          actorId,
        },
      },
      select: CHAT_MESSAGE_ID_SELECT,
    })

  if (!targetMessage) {
    return null
  }

  await prisma.chatMessage.update({
    where: {
      id: targetMessage.id,
    },
    data: {
      feedback,
    },
  })

  return findChatSessionByActor(actorId, sessionId)
}
