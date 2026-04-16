import { NextResponse } from 'next/server'
import { parseInterruptMessageBody } from '../../../requests'
import { persistInterruptedReplyForActor } from '@/server/chat/services'
import {
  jsonError,
  parseJsonBodyOrError,
  withChatActor,
} from '../../../../utils'

interface InterruptedMessageRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(
  request: Request,
  context: InterruptedMessageRouteContext
) {
  const { data: parsedBody, errorResponse } = await parseJsonBodyOrError(
    request,
    parseInterruptMessageBody
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor(async (actor) => {
    const { sessionId } = await context.params
    const result = await persistInterruptedReplyForActor({
      actorId: actor.id,
      body: parsedBody,
      sessionId,
    })

    if (result.error === 'session_not_found') {
      return jsonError('会话不存在或无权限访问', 404)
    }

    if (result.error === 'message_count_mismatch') {
      return jsonError('会话状态已变更，请刷新后重试', 409)
    }

    return NextResponse.json({ session: result.session })
  })
}
