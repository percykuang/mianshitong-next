import { getChatModel, getChatModelRuntimeInfo } from '@mianshitong/providers'
import {
  findOrCreateChatSession,
  persistUserMessageAndLoadConversation,
} from './persistence'
import {
  parseChatRequest,
  toConversation,
  type ChatRequestBody,
} from './request'
import { createChatResponseStream, createChatStreamHeaders } from './stream'
import { jsonError, parseJsonBody, resolveChatActor } from './utils'

export async function POST(request: Request) {
  const body = await parseJsonBody<ChatRequestBody>(request)
  const { data: parsedRequest, errorResponse } = parseChatRequest(body)

  if (!parsedRequest) {
    return errorResponse
  }

  try {
    const { message, normalizedModelId, normalizedSessionId } = parsedRequest
    const model = getChatModel(normalizedModelId)
    const runtime = getChatModelRuntimeInfo(normalizedModelId)
    const { actor, errorResponse: actorErrorResponse } =
      await resolveChatActor()

    if (!actor) {
      return actorErrorResponse
    }

    const session = await findOrCreateChatSession({
      actor,
      message,
      normalizedModelId,
      normalizedSessionId,
    })

    if (!session) {
      return jsonError('会话不存在或无权限访问', 404)
    }

    const persistedSessionId = session.id
    const sessionMessages = await persistUserMessageAndLoadConversation({
      message,
      normalizedModelId,
      sessionId: persistedSessionId,
    })
    const conversation = toConversation(sessionMessages)
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
    console.error('[api/chat] model invoke failed', error)

    return jsonError('AI 服务暂时不可用，请稍后再试', 500)
  }
}
