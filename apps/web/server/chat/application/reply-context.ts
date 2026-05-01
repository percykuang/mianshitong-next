import { type ChatModelClient, getChatModel } from '@mianshitong/llm'
import { createLogger } from '@mianshitong/shared/runtime'

import {
  type CareerWorkflowContextResult,
  buildCareerWorkflowContext,
} from '@/server/career'
import { persistUserMessageAndLoadConversation } from '@/server/chat/persistence'

const logger = createLogger('web.chat.reply')

export interface PreparedChatReply {
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  model: ChatModelClient
  persistedSessionId: string
  resolveWorkflowContext: () => Promise<
    Pick<
      CareerWorkflowContextResult,
      'additionalInstructions' | 'directAnswer' | 'resolveStateCommitAfterReply'
    >
  >
}

export type PreparedChatReplyResult =
  | {
      error: null
      reply: PreparedChatReply
    }
  | {
      error:
        | 'model_catalog_empty'
        | 'model_catalog_unavailable'
        | 'quota_exceeded'
        | 'session_not_found'
      reply: null
    }

export async function buildSafeCareerWorkflowContext(input: {
  actorId: string
  chatModelId: string
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

export async function buildPreparedChatReply(input: {
  actorId: string
  message: string
  chatModelId: string
  resetThreadState?: boolean
  sessionId: string
}): Promise<PreparedChatReply> {
  const model = await getChatModel(input.chatModelId)
  const conversation = await persistUserMessageAndLoadConversation({
    message: input.message,
    chatModelId: input.chatModelId,
    sessionId: input.sessionId,
  })
  return {
    conversation,
    model,
    persistedSessionId: input.sessionId,
    resolveWorkflowContext: async () =>
      buildSafeCareerWorkflowContext({
        actorId: input.actorId,
        chatModelId: input.chatModelId,
        chatSessionId: input.sessionId,
        conversation,
        resetThreadState: input.resetThreadState,
        userInput: input.message,
      }),
  }
}
