import type {
  ParsedChatRequest,
  ParsedStreamMessageBody,
} from '@/app/chat/contracts'
import { findOrCreateChatSession } from '@/server/chat/persistence'

import type { ChatActor } from '../actor'
import {
  resolveUsableChatModelId,
  toChatModelCatalogRuntimeError,
} from './model-catalog'
import {
  type PreparedChatReplyResult,
  buildPreparedChatReply,
} from './reply-context'
import { checkChatQuota } from './resolve-chat-usage'

async function prepareReplyForMessage(input: {
  actor: ChatActor
  message: string
  chatModelId: string
  normalizedSessionId: string | null
}): Promise<PreparedChatReplyResult> {
  const quota = await checkChatQuota(input.actor)

  if (quota.exceeded) {
    return {
      error: 'quota_exceeded',
      reply: null,
    }
  }

  const normalizedChatModelId = await resolveUsableChatModelId(
    input.chatModelId
  )

  if (normalizedChatModelId.error) {
    return {
      error: normalizedChatModelId.error,
      reply: null,
    }
  }

  const sessionResult = await findOrCreateChatSession({
    actor: input.actor,
    message: input.message,
    chatModelId: normalizedChatModelId.modelId,
    normalizedSessionId: input.normalizedSessionId,
  })

  if (sessionResult.error) {
    return {
      error: sessionResult.error,
      reply: null,
    }
  }

  try {
    return {
      error: null,
      reply: await buildPreparedChatReply({
        actorId: input.actor.id,
        message: input.message,
        chatModelId: normalizedChatModelId.modelId,
        sessionId: sessionResult.session.id,
      }),
    }
  } catch (error) {
    return {
      error: toChatModelCatalogRuntimeError(error),
      reply: null,
    }
  }
}

export async function prepareChatReply(
  actor: ChatActor,
  input: ParsedChatRequest
): Promise<PreparedChatReplyResult> {
  return prepareReplyForMessage({
    actor,
    message: input.message,
    chatModelId: input.chatModelId,
    normalizedSessionId: input.normalizedSessionId,
  })
}

export async function prepareSessionChatReply(input: {
  actor: ChatActor
  body: ParsedStreamMessageBody
  sessionId: string
}): Promise<PreparedChatReplyResult> {
  return prepareReplyForMessage({
    actor: input.actor,
    message: input.body.content,
    chatModelId: input.body.chatModelId,
    normalizedSessionId: input.sessionId,
  })
}
