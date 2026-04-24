import { createLogger } from '@mianshitong/shared/runtime'

import { createChatReplyStreamResponse } from '@/app/api/chat/reply-route'
import { prepareEditedChatReply } from '@/server/chat'

import { parseJsonBodyOrError, withChatActor } from '../../../../../../utils'
import { parseEditMessageBody } from '../../../../../requests'

const logger = createLogger('web.api.chat.edit-stream')

interface EditMessageStreamRouteContext {
  params: Promise<{ messageId: string; sessionId: string }>
}

export async function POST(
  request: Request,
  context: EditMessageStreamRouteContext
) {
  const { data: content, errorResponse } = await parseJsonBodyOrError(
    request,
    parseEditMessageBody
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
        const { messageId, sessionId } = await context.params
        return prepareEditedChatReply({
          actor,
          content,
          messageId,
          sessionId,
        })
      },
    })
  )
}
