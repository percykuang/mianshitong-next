import { jsonError } from './utils'

export type ChatRouteErrorCode =
  | 'message_not_editable'
  | 'model_catalog_empty'
  | 'model_catalog_unavailable'
  | 'quota_exceeded'
  | 'session_conflict'
  | 'session_not_found'

const CHAT_ROUTE_ERROR_BY_CODE: Record<
  ChatRouteErrorCode,
  {
    message: string
    status: number
  }
> = {
  message_not_editable: {
    message: '当前仅支持编辑最后一条用户消息',
    status: 400,
  },
  model_catalog_empty: {
    message: '当前系统还没有可用模型，请联系管理员完成配置',
    status: 503,
  },
  model_catalog_unavailable: {
    message: '模型服务暂时不可用，请稍后重试',
    status: 503,
  },
  quota_exceeded: {
    message: '今日模型配额已用完，请明天再试',
    status: 429,
  },
  session_conflict: {
    message: '会话状态已变更，请刷新后重试',
    status: 409,
  },
  session_not_found: {
    message: '会话不存在或无权限访问',
    status: 404,
  },
}

export function chatRouteError(code: ChatRouteErrorCode) {
  const error = CHAT_ROUTE_ERROR_BY_CODE[code]
  return jsonError(error.message, error.status)
}

export function chatServiceUnavailableError() {
  return jsonError('AI 服务暂时不可用，请稍后再试', 500)
}
