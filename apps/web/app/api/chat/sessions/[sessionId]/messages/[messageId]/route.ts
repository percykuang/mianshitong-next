import { NextResponse } from 'next/server'
import { updateActorChatMessageFeedback } from '@/server/chat/services'
import { parseUpdateMessageFeedbackBody } from '../../../requests'
import {
  jsonError,
  parseJsonBodyOrError,
  withChatActor,
} from '../../../../utils'

interface SessionMessageRouteContext {
  params: Promise<{ messageId: string; sessionId: string }>
}

export async function PATCH(
  request: Request,
  context: SessionMessageRouteContext
) {
  const { data: feedback, errorResponse } = await parseJsonBodyOrError(
    request,
    parseUpdateMessageFeedbackBody
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor(async (actor) => {
    const { messageId, sessionId } = await context.params
    const session = await updateActorChatMessageFeedback({
      actorId: actor.id,
      feedback,
      messageId,
      sessionId,
    })

    if (!session) {
      return jsonError('消息不存在或无权限访问', 404)
    }

    return NextResponse.json({ session })
  })
}
