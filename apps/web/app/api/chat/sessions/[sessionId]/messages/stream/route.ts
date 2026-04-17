import { prepareSessionChatReply } from '@/server/chat/services'
import {
  createChatResponseStream,
  createChatStreamHeaders,
} from '@/app/api/chat/stream'
import {
  jsonError,
  parseJsonBodyOrError,
  withChatActor,
} from '@/app/api/chat/utils'
import { parseStreamMessageBody } from '../../../requests'

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

  return withChatActor(async (actor) => {
    try {
      const { sessionId } = await context.params
      const result = await prepareSessionChatReply({
        actor,
        body: parsedBody,
        sessionId,
      })

      if (result.error === 'session_not_found') {
        return jsonError('会话不存在或无权限访问', 404)
      }

      if (result.error === 'quota_exceeded') {
        return jsonError('今日模型配额已用完，请明天再试', 429)
      }

      if (!result.reply) {
        return jsonError('AI 服务暂时不可用，请稍后再试', 500)
      }

      const { conversation, model, persistedSessionId, runtime } = result.reply
      const stream = createChatResponseStream({
        actorId: actor.id,
        conversation,
        model,
        persistedSessionId,
        requestSignal: request.signal,
      })

      return new Response(stream, {
        headers: createChatStreamHeaders({
          persistedSessionId,
          runtime,
        }),
      })
    } catch (error) {
      console.error('[api/chat-session-stream] model invoke failed', error)

      return jsonError('AI 服务暂时不可用，请稍后再试', 500)
    }
  })
}
