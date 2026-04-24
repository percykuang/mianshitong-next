import {
  type SafeParseDataResult,
  safeParseWithIssueMessage,
} from '@mianshitong/shared/runtime'

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

function toParseChatRequestResult(
  result: SafeParseDataResult<ParsedChatRequest>
): ParseChatRequestResult {
  if (result.errorMessage !== null) {
    return {
      data: null,
      errorResponse: jsonError(result.errorMessage, 400),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
}

export function parseChatRequest(
  body: ChatRequestBody | null
): ParseChatRequestResult {
  return toParseChatRequestResult(
    safeParseWithIssueMessage(chatRequestBodySchema, body)
  )
}

export type { ChatRequestBody, ChatRequestMessage, ParsedChatRequest }
