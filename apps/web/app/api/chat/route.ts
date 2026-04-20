import { prepareChatReply } from '@/server/chat/services'

import { parseChatRequest } from './request'
import { createChatResponseStream, createChatStreamHeaders } from './stream'
import { jsonError, parseJsonBodyOrError, withChatActor } from './utils'

export async function POST(request: Request) {
  const { data: parsedRequest, errorResponse } = await parseJsonBodyOrError(
    request,
    parseChatRequest
  )

  if (errorResponse) {
    return errorResponse
  }

  return withChatActor(async (actor) => {
    try {
      const result = await prepareChatReply(actor, parsedRequest)

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
      console.error('[api/chat] model invoke failed', error)

      return jsonError('AI 服务暂时不可用，请稍后再试', 500)
    }
  })
}
