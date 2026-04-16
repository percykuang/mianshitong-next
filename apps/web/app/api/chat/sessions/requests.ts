import {
  createSessionBodySchema,
  editMessageBodySchema,
  interruptMessageBodySchema,
  streamMessageBodySchema,
  updateMessageFeedbackBodySchema,
  updateSessionBodySchema,
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

export function parseCreateSessionBody(
  body: CreateSessionBody | null
): ParseCreateSessionBodyResult {
  const result = createSessionBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError(
        getValidationErrorMessage(result.error.issues[0]?.message),
        400
      ),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
}

export function parseUpdateSessionBody(
  body: UpdateSessionBody | null
): ParseUpdateSessionBodyResult {
  const result = updateSessionBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError(
        getValidationErrorMessage(result.error.issues[0]?.message),
        400
      ),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
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
  const result = editMessageBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError(
        getValidationErrorMessage(result.error.issues[0]?.message),
        400
      ),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
}

export function parseInterruptMessageBody(
  body: InterruptMessageBody | null
): ParseInterruptMessageBodyResult {
  const result = interruptMessageBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError(
        getValidationErrorMessage(result.error.issues[0]?.message),
        400
      ),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
}

export function parseStreamMessageBody(
  body: StreamMessageBody | null
): ParseStreamMessageBodyResult {
  const result = streamMessageBodySchema.safeParse(body)

  if (!result.success) {
    return {
      data: null,
      errorResponse: jsonError(
        getValidationErrorMessage(result.error.issues[0]?.message),
        400
      ),
    }
  }

  return {
    data: result.data,
    errorResponse: null,
  }
}

export type {
  CreateSessionBody,
  EditMessageBody,
  InterruptMessageBody,
  StreamMessageBody,
  UpdateMessageFeedbackBody,
  UpdateSessionBody,
}
