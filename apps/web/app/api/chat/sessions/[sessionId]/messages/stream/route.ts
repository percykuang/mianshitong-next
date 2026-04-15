import { getChatModel, getChatModelRuntimeInfo } from '@mianshitong/providers'
import {
  findOrCreateChatSession,
  persistUserMessageAndLoadConversation,
} from '@/app/api/chat/persistence'
import { toConversation } from '@/app/api/chat/request'
import {
  createChatResponseStream,
  createChatStreamHeaders,
} from '@/app/api/chat/stream'
import {
  jsonError,
  parseJsonBody,
  resolveChatActor,
} from '@/app/api/chat/utils'
import {
  parseStreamMessageBody,
  type StreamMessageBody,
} from '../../../requests'

interface MessageStreamRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function POST(
  request: Request,
  context: MessageStreamRouteContext
) {
  const { actor, errorResponse: actorErrorResponse } = await resolveChatActor()

  if (!actor) {
    return actorErrorResponse
  }

  const body = await parseJsonBody<StreamMessageBody>(request)
  const { data: parsedBody, errorResponse } = parseStreamMessageBody(body)

  if (!parsedBody) {
    return errorResponse
  }

  try {
    const { sessionId } = await context.params
    const { content, normalizedModelId } = parsedBody
    const model = getChatModel(normalizedModelId)
    const runtime = getChatModelRuntimeInfo(normalizedModelId)
    const session = await findOrCreateChatSession({
      actor,
      message: content,
      normalizedModelId,
      normalizedSessionId: sessionId,
    })

    if (!session) {
      return jsonError('会话不存在或无权限访问', 404)
    }

    const persistedSessionId = session.id
    const sessionMessages = await persistUserMessageAndLoadConversation({
      message: content,
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
    console.error('[api/chat-session-stream] model invoke failed', error)

    return jsonError('AI 服务暂时不可用，请稍后再试', 500)
  }
}
