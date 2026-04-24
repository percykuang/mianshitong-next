import { getChatModel } from '@mianshitong/llm'

import { editUserMessageAndLoadConversation } from '@/server/chat/persistence'

import type { ChatActor } from '../actor'
import {
  type PreparedChatReply,
  buildSafeCareerWorkflowContext,
} from './reply-context'
import { checkChatQuota } from './resolve-chat-usage'

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
      model: getChatModel(result.chatModelId),
      persistedSessionId: result.sessionId,
      resolveWorkflowContext: async () =>
        buildSafeCareerWorkflowContext({
          actorId: input.actor.id,
          chatSessionId: result.sessionId,
          conversation: result.conversation,
          resetThreadState: true,
          userInput: input.content,
        }),
    },
  }
}
