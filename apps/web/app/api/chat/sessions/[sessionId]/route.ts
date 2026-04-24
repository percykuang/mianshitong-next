import { NextResponse } from 'next/server'

import {
  deleteActorChatSession,
  getActorChatSession,
  updateActorChatSession,
} from '@/server/chat'

import { chatRouteError } from '../../errors'
import { parseJsonBodyOrError, withChatActor } from '../../utils'
import { parseUpdateSessionBody } from '../requests'

interface SessionRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function GET(_: Request, context: SessionRouteContext) {
  return withChatActor(async (actor) => {
    const { sessionId } = await context.params
    const session = await getActorChatSession(actor.id, sessionId)

    if (!session) {
      return chatRouteError('session_not_found')
    }

    return NextResponse.json({ session })
  })
}

export async function PATCH(request: Request, context: SessionRouteContext) {
  const { data: parsedBody, errorResponse } = await parseJsonBodyOrError(
    request,
    parseUpdateSessionBody
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor(async (actor) => {
    const { sessionId } = await context.params
    const session = await updateActorChatSession(
      actor.id,
      sessionId,
      parsedBody
    )

    if (!session) {
      return chatRouteError('session_not_found')
    }

    return NextResponse.json({ session })
  })
}

export async function DELETE(_: Request, context: SessionRouteContext) {
  return withChatActor(async (actor) => {
    const { sessionId } = await context.params
    const isDeleted = await deleteActorChatSession(actor.id, sessionId)

    if (!isDeleted) {
      return chatRouteError('session_not_found')
    }

    return NextResponse.json({ ok: true })
  })
}
