import type {
  ParsedCreateSessionBody,
  ParsedInterruptMessageBody,
  ParsedUpdateMessageFeedbackBody,
  ParsedUpdateSessionBody,
} from '@/app/chat/contracts'
import type { ChatSessionPreview } from '@/app/chat/domain'
import { persistInterruptedAssistantReply } from '@/server/chat/persistence'

import { getCurrentChatActor } from '../actor'
import type { ChatActor } from '../actor'
import {
  createChatSession,
  deleteAllChatSessionsByActor,
  deleteChatSessionByActor,
  findChatSessionByActor,
  listChatSessionsByActor,
  updateChatMessageFeedbackByActor,
  updateChatSessionByActor,
} from '../session'
import { resolveUsableChatModelId } from './model-catalog'

export async function listActorChatSessions(actorId: string) {
  return listChatSessionsByActor(actorId)
}

export async function loadCurrentActorChatSessions(options?: {
  createGuest?: boolean
}) {
  const actor = await getCurrentChatActor(options)

  if (!actor) {
    return {
      actor: null,
      sessions: [] as ChatSessionPreview[],
    }
  }

  return {
    actor,
    sessions: await listChatSessionsByActor(actor.id),
  }
}

export async function getActorChatSession(actorId: string, sessionId: string) {
  return findChatSessionByActor(actorId, sessionId)
}

export async function createActorChatSession(
  actor: Pick<ChatActor, 'authUserId' | 'id'>,
  input: ParsedCreateSessionBody
) {
  const modelId = await resolveUsableChatModelId(input.modelId)

  if (modelId.error) {
    return {
      error: modelId.error,
      session: null,
    }
  }

  return {
    error: null,
    session: await createChatSession({
      actorId: actor.id,
      userId: actor.authUserId,
      title: input.title,
      modelId: modelId.modelId,
    }),
  }
}

export async function updateActorChatSession(
  actorId: string,
  sessionId: string,
  input: ParsedUpdateSessionBody
) {
  return updateChatSessionByActor(actorId, sessionId, input)
}

export async function deleteActorChatSession(
  actorId: string,
  sessionId: string
) {
  return deleteChatSessionByActor(actorId, sessionId)
}

export async function deleteAllActorChatSessions(actorId: string) {
  return deleteAllChatSessionsByActor(actorId)
}

export async function updateActorChatMessageFeedback(input: {
  actorId: string
  feedback: ParsedUpdateMessageFeedbackBody
  messageId: string
  sessionId: string
}): Promise<ChatSessionPreview | null> {
  return updateChatMessageFeedbackByActor(
    input.actorId,
    input.sessionId,
    input.messageId,
    input.feedback
  )
}

type PersistInterruptedReplyResult =
  | {
      error: 'message_count_mismatch'
      session: null
    }
  | {
      error: 'session_not_found'
      session: null
    }
  | {
      error: null
      session: ChatSessionPreview
    }

export async function persistInterruptedReplyForActor(input: {
  actorId: string
  body: ParsedInterruptMessageBody
  sessionId: string
}): Promise<PersistInterruptedReplyResult> {
  const result = await persistInterruptedAssistantReply({
    actorId: input.actorId,
    content: input.body.content,
    expectedMessageCount: input.body.expectedMessageCount,
    sessionId: input.sessionId,
  })

  if (result.error === 'session_not_found') {
    return {
      error: 'session_not_found',
      session: null,
    }
  }

  if (result.error === 'message_count_mismatch') {
    return {
      error: 'message_count_mismatch',
      session: null,
    }
  }

  const session = await findChatSessionByActor(input.actorId, result.sessionId)

  if (!session) {
    return {
      error: 'session_not_found',
      session: null,
    }
  }

  return {
    error: null,
    session,
  }
}
