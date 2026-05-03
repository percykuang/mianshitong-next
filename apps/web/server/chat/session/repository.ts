import { db } from '@mianshitong/db'

import {
  type ChatSessionPreview,
  DEFAULT_CHAT_SESSION_TITLE,
} from '@/app/chat/domain'

import { toChatSessionPreview } from './presenter'
import {
  type ChatMessageIdRecord,
  type ChatSessionSummary,
  type PersistedChatSessionWithMessages,
} from './query'

type ChatMessageFeedbackValue = 'dislike' | 'like' | null

function normalizeSessionTitle(title: string | undefined) {
  const normalizedTitle = title?.trim() ?? ''
  return normalizedTitle
    ? normalizedTitle.slice(0, 80)
    : DEFAULT_CHAT_SESSION_TITLE
}

function toChatSessionPreviews(
  sessions: PersistedChatSessionWithMessages[]
): ChatSessionPreview[] {
  return sessions.map(toChatSessionPreview)
}

function buildChatSessionUpdateData(
  currentSession: ChatSessionSummary,
  input: UpdateChatSessionInput
) {
  const nextPinned =
    typeof input.pinned === 'boolean' ? input.pinned : currentSession.pinned

  return {
    ...(typeof input.title === 'string'
      ? {
          title: normalizeSessionTitle(input.title),
          titleSource: 'manual' as const,
        }
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
  const sessions = await db.chatSession.listByActor(actorId)

  return toChatSessionPreviews(sessions)
}

export async function findChatSessionByActor(
  actorId: string,
  sessionId: string
): Promise<ChatSessionPreview | null> {
  const session = await db.chatSession.findByActor(actorId, sessionId)

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
  const hasManualTitle =
    typeof input.title === 'string' && input.title.trim().length > 0
  const session = await db.chatSession.create({
    actorId: input.actorId,
    modelId: input.modelId,
    preview: '',
    title: normalizeSessionTitle(input.title),
    titleSource: hasManualTitle ? 'manual' : 'fallback',
    userId: input.userId,
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
  const currentSession = await db.chatSession.findSummaryByActor(
    actorId,
    sessionId
  )

  if (!currentSession) {
    return null
  }

  await db.chatSession.updateById({
    sessionId: currentSession.id,
    ...buildChatSessionUpdateData(currentSession, input),
  })

  return findChatSessionByActor(actorId, sessionId)
}

export async function deleteChatSessionByActor(
  actorId: string,
  sessionId: string
) {
  const result = await db.chatSession.deleteByActor(actorId, sessionId)

  return result.count > 0
}

export async function deleteAllChatSessionsByActor(actorId: string) {
  const result = await db.chatSession.deleteAllByActor(actorId)

  return result.count
}

export async function updateChatMessageFeedbackByActor(
  actorId: string,
  sessionId: string,
  messageId: string,
  feedback: ChatMessageFeedbackValue
): Promise<ChatSessionPreview | null> {
  const targetMessage: ChatMessageIdRecord | null =
    await db.chatMessage.findIdByActorSession({
      actorId,
      messageId,
      sessionId,
    })

  if (!targetMessage) {
    return null
  }

  await db.chatMessage.updateFeedback({
    messageId: targetMessage.id,
    feedback,
  })

  return findChatSessionByActor(actorId, sessionId)
}

export async function getChatSessionTitleGenerationContextByActor(
  actorId: string,
  sessionId: string
) {
  return db.chatSession.findTitleGenerationContextByActor({
    actorId,
    fallbackTitle: DEFAULT_CHAT_SESSION_TITLE,
    sessionId,
  })
}

export async function updateGeneratedChatSessionTitleByActor(input: {
  actorId: string
  sessionId: string
  title: string
}) {
  const result = await db.chatSession.updateGeneratedTitleByActor({
    actorId: input.actorId,
    fallbackTitle: DEFAULT_CHAT_SESSION_TITLE,
    sessionId: input.sessionId,
    title: normalizeSessionTitle(input.title),
  })

  if (result.count === 0) {
    return null
  }

  return findChatSessionByActor(input.actorId, input.sessionId)
}
