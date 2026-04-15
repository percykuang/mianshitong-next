import { getChatModel, getChatModelRuntimeInfo } from '@mianshitong/providers'
import {
  createChatResponseStream,
  createChatStreamHeaders,
} from '@/app/api/chat/stream'
import { editUserMessageAndLoadConversation } from '@/app/api/chat/persistence'
import {
  parseEditMessageBody,
  type EditMessageBody,
} from '../../../../../requests'
import {
  jsonError,
  parseJsonBody,
  resolveChatActor,
} from '../../../../../../utils'

interface EditMessageStreamRouteContext {
  params: Promise<{ messageId: string; sessionId: string }>
}

export async function POST(
  request: Request,
  context: EditMessageStreamRouteContext
) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  const body = await parseJsonBody<EditMessageBody>(request)
  const { data: content, errorResponse: bodyErrorResponse } =
    parseEditMessageBody(body)

  if (bodyErrorResponse) {
    return bodyErrorResponse
  }

  try {
    const { messageId, sessionId } = await context.params
    const result = await editUserMessageAndLoadConversation({
      actorId: actor.id,
      message: content,
      messageId,
      sessionId,
    })

    if (result.error === 'session_not_found') {
      return jsonError('会话不存在或无权限访问', 404)
    }

    if (result.error === 'message_not_editable') {
      return jsonError('当前仅支持编辑最后一条用户消息', 400)
    }

    const model = getChatModel(result.normalizedModelId)
    const runtime = getChatModelRuntimeInfo(result.normalizedModelId)
    const stream = createChatResponseStream({
      conversation: result.conversation,
      model,
      persistedSessionId: result.sessionId,
      requestSignal: request.signal,
    })

    return new Response(stream, {
      headers: createChatStreamHeaders({
        persistedSessionId: result.sessionId,
        runtime,
      }),
    })
  } catch (error) {
    console.error('[api/chat-edit] model invoke failed', error)

    return jsonError('AI 服务暂时不可用，请稍后再试', 500)
  }
}
