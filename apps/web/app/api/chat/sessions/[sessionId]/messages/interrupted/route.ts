import { NextResponse } from 'next/server'
import { persistInterruptedAssistantReply } from '@/app/api/chat/persistence'
import {
  parseInterruptMessageBody,
  type InterruptMessageBody,
} from '../../../requests'
import { findChatSessionByActor } from '@/server/chat-session-repository'
import { jsonError, parseJsonBody, resolveChatActor } from '../../../../utils'

interface InterruptedMessageRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(
  request: Request,
  context: InterruptedMessageRouteContext
) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const body = await parseJsonBody<InterruptMessageBody>(request)
  const { data: parsedBody, errorResponse: bodyErrorResponse } =
    parseInterruptMessageBody(body)

  if (!parsedBody) {
    return bodyErrorResponse
  }

  const { sessionId } = await context.params
  const result = await persistInterruptedAssistantReply({
    actorId: actor.id,
    content: parsedBody.content,
    expectedMessageCount: parsedBody.expectedMessageCount,
    sessionId,
  })

  if (result.error === 'session_not_found') {
    return jsonError('会话不存在或无权限访问', 404)
  }

  const session = await findChatSessionByActor(actor.id, result.sessionId)

  if (!session) {
    return jsonError('会话不存在或无权限访问', 404)
  }

  return NextResponse.json({ session })
}
