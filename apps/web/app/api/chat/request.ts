import {
  isChatModelId,
  normalizeChatModelId,
  type ChatModelId,
} from '@mianshitong/providers'
import { jsonError } from './utils'

export interface ChatRequestMessage {
  role: 'assistant' | 'user'
  content: string
}

export interface ChatRequestBody {
  history?: ChatRequestMessage[]
  message?: string
  modelId?: string
  sessionId?: string
}

export interface ParsedChatRequest {
  message: string
  normalizedModelId: ChatModelId
  normalizedSessionId: string | null
}

type ParseChatRequestResult =
  | {
      data: ParsedChatRequest
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

function normalizeSessionId(sessionId?: string) {
  return typeof sessionId === 'string' && sessionId.trim().length > 0
    ? sessionId.trim()
    : null
}

export function toConversation(messages: ChatRequestMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

export function parseChatRequest(
  body: ChatRequestBody | null
): ParseChatRequestResult {
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!message) {
    return {
      data: null,
      errorResponse: jsonError('消息内容不能为空', 400),
    }
  }

  if (
    typeof body?.modelId === 'string' &&
    body.modelId.trim().length > 0 &&
    !isChatModelId(body.modelId)
  ) {
    return {
      data: null,
      errorResponse: jsonError('不支持的模型类型', 400),
    }
  }

  return {
    data: {
      message,
      normalizedModelId: normalizeChatModelId(body?.modelId),
      normalizedSessionId: normalizeSessionId(body?.sessionId),
    } satisfies ParsedChatRequest,
    errorResponse: null,
  }
}
