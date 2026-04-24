import { createLogger } from '@mianshitong/shared/runtime'

import { createChatReplyStreamResponse } from '@/app/api/chat/reply-route'
import { parseJsonBodyOrError, withChatActor } from '@/app/api/chat/utils'
import { prepareSessionChatReply } from '@/server/chat'

import { parseStreamMessageBody } from '../../../requests'

const logger = createLogger('web.api.chat.session-stream')

interface MessageStreamRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(
  request: Request,
  context: MessageStreamRouteContext
) {
  const { data: parsedBody, errorResponse } = await parseJsonBodyOrError(
    request,
    parseStreamMessageBody
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor((actor) =>
    createChatReplyStreamResponse({
      actor,
      logger,
      requestSignal: request.signal,
      resolveReply: async () => {
        const { sessionId } = await context.params
        return prepareSessionChatReply({
          actor,
          body: parsedBody,
          sessionId,
        })
      },
    })
  )
}
