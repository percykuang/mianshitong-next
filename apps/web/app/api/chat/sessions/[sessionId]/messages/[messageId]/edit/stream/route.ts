import { prepareEditedChatReply } from '@/server/chat/services'
import {
  createChatResponseStream,
  createChatStreamHeaders,
} from '@/app/api/chat/stream'
import { parseEditMessageBody } from '../../../../../requests'
import {
  jsonError,
  parseJsonBodyOrError,
  withChatActor,
} from '../../../../../../utils'

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

  return withChatActor(async (actor) => {
    try {
      const { messageId, sessionId } = await context.params
      const result = await prepareEditedChatReply({
        actorId: actor.id,
        content,
        messageId,
        sessionId,
      })

      if (result.error === 'session_not_found') {
        return jsonError('会话不存在或无权限访问', 404)
      }

      if (result.error === 'message_not_editable') {
        return jsonError('当前仅支持编辑最后一条用户消息', 400)
      }

      if (!result.reply) {
        return jsonError('AI 服务暂时不可用，请稍后再试', 500)
      }

      const { conversation, model, persistedSessionId, runtime } = result.reply
      const stream = createChatResponseStream({
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
      console.error('[api/chat-edit] model invoke failed', error)

      return jsonError('AI 服务暂时不可用，请稍后再试', 500)
    }
  })
}
