import {
  getDefaultChatModelId,
  isChatModelId,
  normalizeChatModelId,
  type ChatModelId,
} from '@mianshitong/providers'
import { jsonError } from '../utils'

export interface CreateSessionBody {
  modelId?: string
  title?: string
}

export interface ParsedCreateSessionBody {
  modelId: ChatModelId
  title?: string
}

type ParseCreateSessionBodyResult =
  | {
      data: ParsedCreateSessionBody
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

export interface UpdateSessionBody {
  pinned?: boolean
  title?: string
}

export interface ParsedUpdateSessionBody {
  pinned?: boolean
  title?: string
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

export interface UpdateMessageFeedbackBody {
  feedback?: 'dislike' | 'like' | null
}

export interface EditMessageBody {
  content?: string
}

export interface InterruptMessageBody {
  content?: string
  expectedMessageCount?: number
}

export interface StreamMessageBody {
  content?: string
  modelId?: string
}

type ParseUpdateMessageFeedbackBodyResult =
  | {
      data: 'dislike' | 'like' | null
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
      data: {
        content: string
        expectedMessageCount: number
      }
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

type ParseStreamMessageBodyResult =
  | {
      data: {
        content: string
        normalizedModelId: ChatModelId
      }
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

function normalizeSessionTitle(title: string | undefined) {
  return title?.trim() ?? ''
}

function isValidFeedback(value: unknown): value is 'dislike' | 'like' | null {
  return value === null || value === 'like' || value === 'dislike'
}

export function parseCreateSessionBody(
  body: CreateSessionBody | null
): ParseCreateSessionBodyResult {
  const modelId =
    typeof body?.modelId === 'string' && body.modelId.trim().length > 0
      ? body.modelId.trim()
      : getDefaultChatModelId()

  if (!isChatModelId(modelId)) {
    return {
      data: null,
      errorResponse: jsonError('不支持的模型类型', 400),
    }
  }

  return {
    data: {
      modelId: normalizeChatModelId(modelId),
      title: body?.title,
    },
    errorResponse: null,
  }
}

export function parseUpdateSessionBody(
  body: UpdateSessionBody | null
): ParseUpdateSessionBodyResult {
  const normalizedTitle =
    typeof body?.title === 'string'
      ? normalizeSessionTitle(body.title)
      : undefined

  if (
    typeof body?.pinned !== 'boolean' &&
    typeof normalizedTitle !== 'string'
  ) {
    return {
      data: null,
      errorResponse: jsonError('至少需要提供一个可更新字段', 400),
    }
  }

  if (typeof normalizedTitle === 'string' && normalizedTitle.length === 0) {
    return {
      data: null,
      errorResponse: jsonError('会话标题不能为空', 400),
    }
  }

  return {
    data: {
      ...(typeof body?.pinned === 'boolean' ? { pinned: body.pinned } : {}),
      ...(typeof normalizedTitle === 'string'
        ? { title: normalizedTitle }
        : {}),
    },
    errorResponse: null,
  }
}

export function parseUpdateMessageFeedbackBody(
  body: UpdateMessageFeedbackBody | null
): ParseUpdateMessageFeedbackBodyResult {
  const hasFeedbackField = body !== null && Object.hasOwn(body, 'feedback')

  if (!hasFeedbackField || !isValidFeedback(body?.feedback)) {
    return {
      data: null,
      errorResponse: jsonError('feedback 只能是 like、dislike 或 null', 400),
    }
  }

  return {
    data: body.feedback,
    errorResponse: null,
  }
}

export function parseEditMessageBody(
  body: EditMessageBody | null
): ParseEditMessageBodyResult {
  const content = typeof body?.content === 'string' ? body.content.trim() : ''

  if (!content) {
    return {
      data: null,
      errorResponse: jsonError('消息内容不能为空', 400),
    }
  }

  return {
    data: content,
    errorResponse: null,
  }
}

export function parseInterruptMessageBody(
  body: InterruptMessageBody | null
): ParseInterruptMessageBodyResult {
  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  const expectedMessageCount =
    typeof body?.expectedMessageCount === 'number'
      ? Math.floor(body.expectedMessageCount)
      : NaN

  if (!content) {
    return {
      data: null,
      errorResponse: jsonError('中断消息内容不能为空', 400),
    }
  }

  if (!Number.isFinite(expectedMessageCount) || expectedMessageCount < 0) {
    return {
      data: null,
      errorResponse: jsonError('expectedMessageCount 非法', 400),
    }
  }

  return {
    data: {
      content,
      expectedMessageCount,
    },
    errorResponse: null,
  }
}

export function parseStreamMessageBody(
  body: StreamMessageBody | null
): ParseStreamMessageBodyResult {
  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  const modelId =
    typeof body?.modelId === 'string' && body.modelId.trim().length > 0
      ? body.modelId.trim()
      : getDefaultChatModelId()

  if (!content) {
    return {
      data: null,
      errorResponse: jsonError('消息内容不能为空', 400),
    }
  }

  if (!isChatModelId(modelId)) {
    return {
      data: null,
      errorResponse: jsonError('不支持的模型类型', 400),
    }
  }

  return {
    data: {
      content,
      normalizedModelId: normalizeChatModelId(modelId),
    },
    errorResponse: null,
  }
}
