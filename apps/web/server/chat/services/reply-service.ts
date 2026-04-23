import {
  type ChatModelId,
  getChatModel,
  getChatModelRuntimeInfo,
} from '@mianshitong/providers'
import { createLogger } from '@mianshitong/shared'

import type {
  ParsedChatRequest,
  ParsedStreamMessageBody,
} from '@/app/chat/contracts'
import {
  type CareerWorkflowContextResult,
  buildCareerWorkflowContext,
} from '@/server/career'
import {
  editUserMessageAndLoadConversation,
  findOrCreateChatSession,
  persistUserMessageAndLoadConversation,
} from '@/server/chat/persistence'

import type { ChatActor } from '../actor'
import { checkChatQuota } from './usage-service'

const logger = createLogger('chat-reply-service')

interface PreparedChatReply {
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  model: ReturnType<typeof getChatModel>
  persistedSessionId: string
  resolveWorkflowContext: () => Promise<
    Pick<
      CareerWorkflowContextResult,
      'additionalInstructions' | 'directAnswer' | 'resolveStateCommitAfterReply'
    >
  >
  runtime: ReturnType<typeof getChatModelRuntimeInfo>
}

type PreparedChatReplyResult =
  | {
      error: null
      reply: PreparedChatReply
    }
  | {
      error: 'quota_exceeded' | 'session_not_found'
      reply: null
    }

async function buildSafeCareerWorkflowContext(input: {
  actorId: string
  chatSessionId: string
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  resetThreadState?: boolean
  userInput: string
}): Promise<
  Pick<
    CareerWorkflowContextResult,
    'additionalInstructions' | 'directAnswer' | 'resolveStateCommitAfterReply'
  >
> {
  try {
    return await buildCareerWorkflowContext(input)
  } catch (error) {
    logger.warn('career workflow failed', error)

    return {
      additionalInstructions: [],
      directAnswer: undefined,
      resolveStateCommitAfterReply: undefined,
    }
  }
}

async function buildPreparedChatReply(input: {
  actorId: string
  message: string
  normalizedModelId: ChatModelId
  resetThreadState?: boolean
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
    resolveWorkflowContext: async () =>
      buildSafeCareerWorkflowContext({
        actorId: input.actorId,
        chatSessionId: input.sessionId,
        conversation,
        resetThreadState: input.resetThreadState,
        userInput: input.message,
      }),
    runtime,
  }
}

export async function prepareChatReply(
  actor: ChatActor,
  input: ParsedChatRequest
): Promise<PreparedChatReplyResult> {
  const quota = await checkChatQuota(actor)

  if (quota.exceeded) {
    return {
      error: 'quota_exceeded',
      reply: null,
    }
  }

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
      actorId: actor.id,
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
  const quota = await checkChatQuota(input.actor)

  if (quota.exceeded) {
    return {
      error: 'quota_exceeded',
      reply: null,
    }
  }

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
      actorId: input.actor.id,
      message: input.body.content,
      normalizedModelId: input.body.normalizedModelId,
      sessionId: sessionResult.session.id,
    }),
  }
}

type PreparedEditedChatReplyResult =
  | {
      error: 'message_not_editable' | 'quota_exceeded' | 'session_not_found'
      reply: null
    }
  | {
      error: null
      reply: PreparedChatReply
    }

export async function prepareEditedChatReply(input: {
  actor: ChatActor
  content: string
  messageId: string
  sessionId: string
}): Promise<PreparedEditedChatReplyResult> {
  const quota = await checkChatQuota(input.actor)

  if (quota.exceeded) {
    return {
      error: 'quota_exceeded',
      reply: null,
    }
  }

  const result = await editUserMessageAndLoadConversation({
    actorId: input.actor.id,
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
      resolveWorkflowContext: async () =>
        buildSafeCareerWorkflowContext({
          actorId: input.actor.id,
          chatSessionId: result.sessionId,
          conversation: result.conversation,
          resetThreadState: true,
          userInput: input.content,
        }),
      runtime: getChatModelRuntimeInfo(result.normalizedModelId),
    },
  }
}
