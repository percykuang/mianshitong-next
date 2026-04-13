import { prisma } from '@mianshitong/db'
import type { ChatSessionPreview } from '@/components'
import {
  toChatSessionPreview,
  type PersistedChatSessionWithMessages,
} from './chat-session-presenter'

const SESSION_MESSAGES_ORDER_BY = [
  { createdAt: 'asc' as const },
  { id: 'asc' as const },
]
const SESSIONS_ORDER_BY = [
  { pinned: 'desc' as const },
  { pinnedAt: 'desc' as const },
  { updatedAt: 'desc' as const },
]
const SESSION_MESSAGES_INCLUDE = {
  messages: {
    orderBy: SESSION_MESSAGES_ORDER_BY,
  },
} as const
const CHAT_SESSION_SUMMARY_SELECT = {
  id: true,
  pinned: true,
  title: true,
} as const

interface ChatSessionSelectResult {
  id: string
  pinned: boolean
  title: string
}

type ChatMessageFeedbackValue = 'dislike' | 'like' | null

interface ChatMessageSelectResult {
  id: string
}

interface ChatPrismaClient {
  chatMessage: {
    findFirst(args: {
      where: {
        id: string
        sessionId: string
        session: {
          actorId: string
        }
      }
      select: {
        id: true
      }
    }): Promise<ChatMessageSelectResult | null>
    update(args: {
      where: {
        id: string
      }
      data: {
        feedback: ChatMessageFeedbackValue
      }
    }): Promise<unknown>
  }
  chatSession: {
    create(args: {
      data: {
        actorId: string
        modelId: string
        preview: string
        title: string
        userId?: string
      }
      include: {
        messages: {
          orderBy: typeof SESSION_MESSAGES_ORDER_BY
        }
      }
    }): Promise<PersistedChatSessionWithMessages>
    deleteMany(args: {
      where: {
        actorId: string
        id?: string
      }
    }): Promise<{ count: number }>
    findFirst(args: {
      where: {
        actorId: string
        id: string
      }
      include?: {
        messages: {
          orderBy: typeof SESSION_MESSAGES_ORDER_BY
        }
      }
      select?: {
        id: true
        pinned: true
        title: true
      }
    }): Promise<
      PersistedChatSessionWithMessages | ChatSessionSelectResult | null
    >
    findMany(args: {
      where: { actorId: string }
      include: {
        messages: {
          orderBy: typeof SESSION_MESSAGES_ORDER_BY
        }
      }
      orderBy: typeof SESSIONS_ORDER_BY
    }): Promise<PersistedChatSessionWithMessages[]>
    update(args: {
      where: {
        id: string
      }
      data: {
        pinned?: boolean
        pinnedAt?: Date | null
        title?: string
      }
      include: {
        messages: {
          orderBy: typeof SESSION_MESSAGES_ORDER_BY
        }
      }
    }): Promise<PersistedChatSessionWithMessages>
  }
}

const chatPrisma = prisma as unknown as ChatPrismaClient

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
  return (await chatPrisma.chatSession.findFirst({
    where: getActorSessionWhere(actorId, sessionId),
    include: SESSION_MESSAGES_INCLUDE,
  })) as PersistedChatSessionWithMessages | null
}

async function findChatSessionSummaryByActor(
  actorId: string,
  sessionId: string
): Promise<ChatSessionSelectResult | null> {
  return (await chatPrisma.chatSession.findFirst({
    where: getActorSessionWhere(actorId, sessionId),
    select: CHAT_SESSION_SUMMARY_SELECT,
  })) as ChatSessionSelectResult | null
}

function buildChatSessionUpdateData(
  currentSession: ChatSessionSelectResult,
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
  const sessions = await chatPrisma.chatSession.findMany({
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
  const session = await chatPrisma.chatSession.create({
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

  const updatedSession = await chatPrisma.chatSession.update({
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
  const result = await chatPrisma.chatSession.deleteMany({
    where: getActorSessionWhere(actorId, sessionId),
  })

  return result.count > 0
}

export async function deleteAllChatSessionsByActor(actorId: string) {
  const result = await chatPrisma.chatSession.deleteMany({
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
  const targetMessage = await chatPrisma.chatMessage.findFirst({
    where: {
      id: messageId,
      sessionId,
      session: {
        actorId,
      },
    },
    select: {
      id: true,
    },
  })

  if (!targetMessage) {
    return null
  }

  await chatPrisma.chatMessage.update({
    where: {
      id: targetMessage.id,
    },
    data: {
      feedback,
    },
  })

  return findChatSessionByActor(actorId, sessionId)
}
