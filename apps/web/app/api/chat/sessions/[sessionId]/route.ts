import { NextResponse } from 'next/server'
import {
  deleteChatSessionByActor,
  findChatSessionByActor,
  updateChatSessionByActor,
} from '@/server/chat-session-repository'
import { parseUpdateSessionBody, type UpdateSessionBody } from '../requests'
import { jsonError, parseJsonBody, resolveChatActor } from '../../utils'

interface SessionRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function GET(_: Request, context: SessionRouteContext) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const { sessionId } = await context.params
  const session = await findChatSessionByActor(actor.id, sessionId)

  if (!session) {
    return jsonError('会话不存在或无权限访问', 404)
  }

  return NextResponse.json({ session })
}

export async function PATCH(request: Request, context: SessionRouteContext) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const body = await parseJsonBody<UpdateSessionBody>(request)
  const { data: parsedBody, errorResponse: bodyErrorResponse } =
    parseUpdateSessionBody(body)

  if (!parsedBody) {
    return bodyErrorResponse
  }

  const { sessionId } = await context.params
  const session = await updateChatSessionByActor(
    actor.id,
    sessionId,
    parsedBody
  )

  if (!session) {
    return jsonError('会话不存在或无权限访问', 404)
  }

  return NextResponse.json({ session })
}

export async function DELETE(_: Request, context: SessionRouteContext) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const { sessionId } = await context.params
  const isDeleted = await deleteChatSessionByActor(actor.id, sessionId)

  if (!isDeleted) {
    return jsonError('会话不存在或无权限访问', 404)
  }

  return NextResponse.json({ ok: true })
}
