import type { DbClient } from '../client-types'
import type {
  DbChatConversationMessageRow,
  DbChatMessageCompletionStatus,
  DbChatMessageFeedback,
  DbChatMessageIdRecord,
} from './types'

const CHAT_MESSAGE_ORDER_BY = [
  { createdAt: 'asc' as const },
  { id: 'asc' as const },
]

function findIdByActorSession(
  client: DbClient,
  input: {
    actorId: string
    messageId: string
    sessionId: string
  }
): Promise<DbChatMessageIdRecord | null> {
  return client.chatMessage.findFirst({
    where: {
      id: input.messageId,
      sessionId: input.sessionId,
      session: {
        actorId: input.actorId,
      },
    },
    select: {
      id: true,
    },
  })
}

async function updateFeedback(
  client: DbClient,
  input: {
    feedback: DbChatMessageFeedback
    messageId: string
  }
) {
  await client.chatMessage.update({
    where: {
      id: input.messageId,
    },
    data: {
      feedback: input.feedback,
    },
  })
}

async function createUser(
  client: DbClient,
  input: { content: string; sessionId: string }
) {
  await client.chatMessage.create({
    data: {
      sessionId: input.sessionId,
      role: 'user',
      content: input.content,
    },
  })
}

function createAssistant(
  client: DbClient,
  input: {
    completionStatus?: DbChatMessageCompletionStatus
    content: string
    sessionId: string
  }
): Promise<{ id: string }> {
  return client.chatMessage.create({
    data: {
      sessionId: input.sessionId,
      role: 'assistant',
      content: input.content,
      ...(input.completionStatus
        ? {
            completionStatus: input.completionStatus,
          }
        : {}),
    },
    select: {
      id: true,
    },
  })
}

function listConversationBySessionId(
  client: DbClient,
  sessionId: string
): Promise<DbChatConversationMessageRow[]> {
  return client.chatMessage.findMany({
    where: {
      sessionId,
    },
    orderBy: CHAT_MESSAGE_ORDER_BY,
    select: {
      role: true,
      content: true,
    },
  })
}

async function updateContent(
  client: DbClient,
  input: {
    content: string
    messageId: string
  }
) {
  await client.chatMessage.update({
    where: {
      id: input.messageId,
    },
    data: {
      content: input.content,
    },
  })
}

async function deleteManyByIds(client: DbClient, messageIds: string[]) {
  if (messageIds.length === 0) {
    return
  }

  await client.chatMessage.deleteMany({
    where: {
      id: {
        in: messageIds,
      },
    },
  })
}

export function createChatMessageDb(client: DbClient) {
  return {
    findIdByActorSession(input: {
      actorId: string
      messageId: string
      sessionId: string
    }) {
      return findIdByActorSession(client, input)
    },
    updateFeedback(input: {
      feedback: DbChatMessageFeedback
      messageId: string
    }) {
      return updateFeedback(client, input)
    },
    createUser(input: { content: string; sessionId: string }) {
      return createUser(client, input)
    },
    createAssistant(input: {
      completionStatus?: DbChatMessageCompletionStatus
      content: string
      sessionId: string
    }) {
      return createAssistant(client, input)
    },
    listConversationBySessionId(sessionId: string) {
      return listConversationBySessionId(client, sessionId)
    },
    updateContent(input: { content: string; messageId: string }) {
      return updateContent(client, input)
    },
    deleteManyByIds(messageIds: string[]) {
      return deleteManyByIds(client, messageIds)
    },
  }
}

export type ChatMessageDb = ReturnType<typeof createChatMessageDb>
