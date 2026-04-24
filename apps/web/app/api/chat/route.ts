import { createLogger } from '@mianshitong/shared/runtime'

import { prepareChatReply } from '@/server/chat'

import { createChatReplyStreamResponse } from './reply-route'
import { parseChatRequest } from './request'
import { parseJsonBodyOrError, withChatActor } from './utils'

const logger = createLogger('web.api.chat')

export async function POST(request: Request) {
  const { data: parsedRequest, errorResponse } = await parseJsonBodyOrError(
    request,
    parseChatRequest
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor((actor) =>
    createChatReplyStreamResponse({
      actor,
      logger,
      requestSignal: request.signal,
      resolveReply: () => prepareChatReply(actor, parsedRequest),
    })
  )
}
