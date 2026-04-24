import { NextResponse } from 'next/server'

import { persistInterruptedReplyForActor } from '@/server/chat'

import { chatRouteError } from '../../../../errors'
import { parseJsonBodyOrError, withChatActor } from '../../../../utils'
import { parseInterruptMessageBody } from '../../../requests'

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
      return chatRouteError('session_not_found')
    }

    if (result.error === 'message_count_mismatch') {
      return chatRouteError('session_conflict')
    }

    return NextResponse.json({ session: result.session })
  })
}
