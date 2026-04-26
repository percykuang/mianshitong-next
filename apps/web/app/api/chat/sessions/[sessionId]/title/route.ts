import { NextResponse } from 'next/server'

import { generateActorChatSessionTitle } from '@/server/chat'

import { chatRouteError } from '../../../errors'
import { withChatActor } from '../../../utils'

interface SessionTitleRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(_: Request, context: SessionTitleRouteContext) {
  return withChatActor(async (actor) => {
    const { sessionId } = await context.params
    const session = await generateActorChatSessionTitle({
      actorId: actor.id,
      sessionId,
    })

    if (!session) {
      return chatRouteError('session_not_found')
    }

    return NextResponse.json({ session })
  })
}
