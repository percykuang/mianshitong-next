import {
  editUserMessageAndLoadConversation,
  findOrCreateChatSession,
  persistUserMessageAndLoadConversation,
} from '@/server/chat/persistence'
import type {
  ParsedChatRequest,
  ParsedStreamMessageBody,
} from '@/app/chat/contracts'
import {
  getChatModel,
  getChatModelRuntimeInfo,
  type ChatModelId,
} from '@mianshitong/providers'
import type { ChatActor } from '../actor'

interface PreparedChatReply {
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  model: ReturnType<typeof getChatModel>
  persistedSessionId: string
  runtime: ReturnType<typeof getChatModelRuntimeInfo>
}

type PreparedChatReplyResult =
  | {
      error: null
      reply: PreparedChatReply
    }
  | {
      error: 'session_not_found'
      reply: null
    }

async function buildPreparedChatReply(input: {
  message: string
  normalizedModelId: ChatModelId
  sessionId: string
}): Promise<PreparedChatReply> {
  const model = getChatModel(input.normalizedModelId)
  const runtime = getChatModelRuntimeInfo(input.normalizedModelId)
  const conversation = await persistUserMessageAndLoadConversation({
    message: input.message,
    normalizedModelId: input.normalizedModelId,
    sessionId: input.sessionId,
  })

  return {
    conversation,
    model,
    persistedSessionId: input.sessionId,
    runtime,
  }
}

export async function prepareChatReply(
  actor: ChatActor,
  input: ParsedChatRequest
): Promise<PreparedChatReplyResult> {
  const sessionResult = await findOrCreateChatSession({
    actor,
    message: input.message,
    normalizedModelId: input.normalizedModelId,
    normalizedSessionId: input.normalizedSessionId,
  })

  if (sessionResult.error) {
    return {
      error: sessionResult.error,
      reply: null,
    }
  }

  return {
    error: null,
    reply: await buildPreparedChatReply({
      message: input.message,
      normalizedModelId: input.normalizedModelId,
      sessionId: sessionResult.session.id,
    }),
  }
}

export async function prepareSessionChatReply(input: {
  actor: ChatActor
  body: ParsedStreamMessageBody
  sessionId: string
}): Promise<PreparedChatReplyResult> {
  const sessionResult = await findOrCreateChatSession({
    actor: input.actor,
    message: input.body.content,
    normalizedModelId: input.body.normalizedModelId,
    normalizedSessionId: input.sessionId,
  })

  if (sessionResult.error) {
    return {
      error: sessionResult.error,
      reply: null,
    }
  }

  return {
    error: null,
    reply: await buildPreparedChatReply({
      message: input.body.content,
      normalizedModelId: input.body.normalizedModelId,
      sessionId: sessionResult.session.id,
    }),
  }
}

type PreparedEditedChatReplyResult =
  | {
      error: 'message_not_editable' | 'session_not_found'
      reply: null
    }
  | {
      error: null
      reply: PreparedChatReply
    }

export async function prepareEditedChatReply(input: {
  actorId: string
  content: string
  messageId: string
  sessionId: string
}): Promise<PreparedEditedChatReplyResult> {
  const result = await editUserMessageAndLoadConversation({
    actorId: input.actorId,
    message: input.content,
    messageId: input.messageId,
    sessionId: input.sessionId,
  })

  if (result.error) {
    return {
      error: result.error,
      reply: null,
    }
  }

  return {
    error: null,
    reply: {
      conversation: result.conversation,
      model: getChatModel(result.normalizedModelId),
      persistedSessionId: result.sessionId,
      runtime: getChatModelRuntimeInfo(result.normalizedModelId),
    },
  }
}
