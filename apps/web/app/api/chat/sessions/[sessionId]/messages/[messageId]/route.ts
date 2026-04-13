import { NextResponse } from 'next/server'
import { updateChatMessageFeedbackByActor } from '@/server/chat-session-repository'
import {
  parseUpdateMessageFeedbackBody,
  type UpdateMessageFeedbackBody,
} from '../../../requests'
import { jsonError, parseJsonBody, resolveChatActor } from '../../../../utils'

interface SessionMessageRouteContext {
  params: Promise<{ messageId: string; sessionId: string }>
}

export async function PATCH(
  request: Request,
  context: SessionMessageRouteContext
) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const body = await parseJsonBody<UpdateMessageFeedbackBody>(request)
  const { data: feedback, errorResponse: bodyErrorResponse } =
    parseUpdateMessageFeedbackBody(body)

  if (bodyErrorResponse) {
    return bodyErrorResponse
  }

  const { messageId, sessionId } = await context.params
  const session = await updateChatMessageFeedbackByActor(
    actor.id,
    sessionId,
    messageId,
    feedback
  )

  if (!session) {
    return jsonError('消息不存在或无权限访问', 404)
  }

  return NextResponse.json({ session })
}
