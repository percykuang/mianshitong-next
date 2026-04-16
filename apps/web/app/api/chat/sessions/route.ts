import { NextResponse } from 'next/server'
import {
  createActorChatSession,
  deleteAllActorChatSessions,
  listActorChatSessions,
} from '@/server/chat/services'
import { parseCreateSessionBody } from './requests'
import { parseJsonBodyOrError, withChatActor } from '../utils'

export async function GET() {
  return withChatActor(async (actor) => {
    const sessions = await listActorChatSessions(actor.id)

    return NextResponse.json({ sessions })
  })
}

export async function POST(request: Request) {
  const { data: parsedBody, errorResponse } = await parseJsonBodyOrError(
    request,
    parseCreateSessionBody
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor(async (actor) => {
    const session = await createActorChatSession(actor, parsedBody)

    return NextResponse.json({ session }, { status: 201 })
  })
}

export async function DELETE() {
  return withChatActor(async (actor) => {
    const deletedCount = await deleteAllActorChatSessions(actor.id)

    return NextResponse.json({
      ok: true,
      deletedCount,
    })
  })
}
