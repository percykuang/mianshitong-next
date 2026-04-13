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

type ParseUpdateMessageFeedbackBodyResult =
  | {
      data: 'dislike' | 'like' | null
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
