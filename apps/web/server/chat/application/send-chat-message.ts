import type { ChatModelId } from '@mianshitong/llm'

import type {
  ParsedChatRequest,
  ParsedStreamMessageBody,
} from '@/app/chat/contracts'
import { findOrCreateChatSession } from '@/server/chat/persistence'

import type { ChatActor } from '../actor'
import {
  type PreparedChatReplyResult,
  buildPreparedChatReply,
} from './reply-context'
import { checkChatQuota } from './resolve-chat-usage'

async function prepareReplyForMessage(input: {
  actor: ChatActor
  message: string
  chatModelId: ChatModelId
  normalizedSessionId: string | null
}): Promise<PreparedChatReplyResult> {
  const quota = await checkChatQuota(input.actor)

  if (quota.exceeded) {
    return {
      error: 'quota_exceeded',
      reply: null,
    }
  }

  const sessionResult = await findOrCreateChatSession({
    actor: input.actor,
    message: input.message,
    chatModelId: input.chatModelId,
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
      actorId: input.actor.id,
      message: input.message,
      chatModelId: input.chatModelId,
      sessionId: sessionResult.session.id,
    }),
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
