import { NextResponse } from 'next/server'
import {
  createChatSession,
  deleteAllChatSessionsByActor,
  listChatSessionsByActor,
} from '@/server/chat-session-repository'
import { parseCreateSessionBody, type CreateSessionBody } from './requests'
import { parseJsonBody, resolveChatActor } from '../utils'

export async function GET() {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const sessions = await listChatSessionsByActor(actor.id)

  return NextResponse.json({ sessions })
}

export async function POST(request: Request) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const body = await parseJsonBody<CreateSessionBody>(request)
  const { data: parsedBody, errorResponse: bodyErrorResponse } =
    parseCreateSessionBody(body)

  if (!parsedBody) {
    return bodyErrorResponse
  }

  const session = await createChatSession({
    actorId: actor.id,
    userId: actor.authUserId,
    title: parsedBody.title,
    modelId: parsedBody.modelId,
  })

  return NextResponse.json({ session }, { status: 201 })
}

export async function DELETE() {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const deletedCount = await deleteAllChatSessionsByActor(actor.id)

  return NextResponse.json({
    ok: true,
    deletedCount,
  })
}
