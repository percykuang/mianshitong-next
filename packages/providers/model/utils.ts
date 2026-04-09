import 'dotenv/config'
import type {
  ChatModelRuntimeInfo,
  MainModelProvider,
  ModelRole,
} from './types'

// 获取并清洗字符串环境变量，空值会被视为未配置。
export function getStringEnv(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

// 获取数字环境变量，非法值会自动回退到默认值。
export function getNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }

  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

// 优先获取主环境变量，其次读取兜底环境变量，最后回退默认值。
export function getStringEnvWithFallback(
  name: string,
  fallbackValue: string,
  fallbackName?: string
) {
  const directValue = getStringEnv(name)
  if (directValue) {
    return directValue
  }

  const fallbackEnvValue =
    fallbackName !== undefined ? getStringEnv(fallbackName) : undefined

  return fallbackEnvValue ?? fallbackValue
}

// 优先获取主数字环境变量，不存在时按兜底变量和默认值回退。
export function getNumberEnvWithFallback(
  name: string,
  fallbackValue: number,
  fallbackName?: string
) {
  const resolvedFallback =
    fallbackName !== undefined
      ? getNumberEnv(fallbackName, fallbackValue)
      : fallbackValue

  return getNumberEnv(name, resolvedFallback)
}

// 统一输出模型选择日志，方便开发期排查实际命中模型。
export function logModelSelection(
  label: string,
  runtime: ChatModelRuntimeInfo
) {
  console.log(
    `[Model] ${label}: ${runtime.displayTarget} -> ${runtime.actualModel}`
  )
}

// 补齐 OpenAI-compatible 接口所需的 /v1 基础路径。
export function normalizeOpenAICompatibleBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  return normalizedBaseUrl.endsWith('/v1')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/v1`
}

// 生成 provider + role 维度的模型实例缓存 key。
export function createModelInstanceCacheKey(
  provider: MainModelProvider,
  role: ModelRole
) {
  return `${provider}:${role}`
}
