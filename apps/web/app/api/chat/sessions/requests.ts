import {
  type SafeParseDataResult,
  type SafeParseSchema,
  safeParseWithIssueMessage,
} from '@mianshitong/shared/runtime'

import {
  type CreateSessionBody,
  type EditMessageBody,
  type InterruptMessageBody,
  type ParsedCreateSessionBody,
  type ParsedInterruptMessageBody,
  type ParsedStreamMessageBody,
  type ParsedUpdateMessageFeedbackBody,
  type ParsedUpdateSessionBody,
  type StreamMessageBody,
  type UpdateMessageFeedbackBody,
  type UpdateSessionBody,
  createSessionBodySchema,
  editMessageBodySchema,
  interruptMessageBodySchema,
  streamMessageBodySchema,
  updateMessageFeedbackBodySchema,
  updateSessionBodySchema,
} from '@/app/chat/contracts'

import { jsonError } from '../utils'

type ParseCreateSessionBodyResult =
  | {
      data: ParsedCreateSessionBody
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

type ParseUpdateSessionBodyResult =
  | {
      data: ParsedUpdateSessionBody
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

type ParseUpdateMessageFeedbackBodyResult =
  | {
      data: ParsedUpdateMessageFeedbackBody
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

type ParseEditMessageBodyResult =
  | {
      data: string
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

type ParseInterruptMessageBodyResult =
  | {
      data: ParsedInterruptMessageBody
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

type ParseStreamMessageBodyResult =
  | {
      data: ParsedStreamMessageBody
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

function getValidationErrorMessage(message: string | undefined) {
  return message ?? '请求参数不合法'
}

function toParseBodyResult<T>(result: SafeParseDataResult<T>):
  | {
      data: T
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    } {
  if (result.errorMessage !== null) {
    return {
      data: null,
      errorResponse: jsonError(
        getValidationErrorMessage(result.errorMessage),
        400
      ),
    }
  }

  return {
    data: result.data as T,
    errorResponse: null,
  }
}

function parseBodyWithSchema<TInput, TOutput>(
  schema: SafeParseSchema<TInput, TOutput>,
  body: TInput
) {
  return toParseBodyResult(safeParseWithIssueMessage(schema, body))
}

export function parseCreateSessionBody(
  body: CreateSessionBody | null
): ParseCreateSessionBodyResult {
  return parseBodyWithSchema(createSessionBodySchema, body)
}

export function parseUpdateSessionBody(
  body: UpdateSessionBody | null
): ParseUpdateSessionBodyResult {
  return parseBodyWithSchema(updateSessionBodySchema, body)
}

export function parseUpdateMessageFeedbackBody(
  body: UpdateMessageFeedbackBody | null
): ParseUpdateMessageFeedbackBodyResult {
  const result = updateMessageFeedbackBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError('feedback 只能是 like、dislike 或 null', 400),
    }
  }

  return {
    data: result.data.feedback,
    errorResponse: null,
  }
}

export function parseEditMessageBody(
  body: EditMessageBody | null
): ParseEditMessageBodyResult {
  return parseBodyWithSchema(editMessageBodySchema, body)
}

export function parseInterruptMessageBody(
  body: InterruptMessageBody | null
): ParseInterruptMessageBodyResult {
  return parseBodyWithSchema(interruptMessageBodySchema, body)
}

export function parseStreamMessageBody(
  body: StreamMessageBody | null
): ParseStreamMessageBodyResult {
  return parseBodyWithSchema(streamMessageBodySchema, body)
}

export type {
  CreateSessionBody,
  EditMessageBody,
  InterruptMessageBody,
  StreamMessageBody,
  UpdateMessageFeedbackBody,
  UpdateSessionBody,
}
