import {
  type ChatRequestBody,
  type ChatRequestMessage,
  type ParsedChatRequest,
  chatRequestBodySchema,
} from '@/app/chat/contracts'

import { jsonError } from './utils'

type ParseChatRequestResult =
  | {
      data: ParsedChatRequest
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
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
  const result = chatRequestBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError(
        result.error.issues[0]?.message ?? '请求参数不合法',
        400
      ),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
}

export type { ChatRequestBody, ChatRequestMessage, ParsedChatRequest }
