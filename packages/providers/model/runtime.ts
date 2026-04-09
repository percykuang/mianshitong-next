import type {
  ChatModelId,
  ChatModelRuntimeInfo,
  MainModelProvider,
  ModelRole,
} from './types'
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  PROVIDER_CONFIG_BY_NAME,
  PROVIDER_ROLE_CONFIG_BY_NAME,
} from './config'
import { getChatModelRole } from './catalog'
import {
  getNumberEnvWithFallback,
  getStringEnv,
  getStringEnvWithFallback,
} from './utils'

export interface ResolvedModelConfig {
  apiKey: string | undefined
  baseURL: string
  maxTokens: number
  model: string
  temperature: number
}

export interface ResolvedChatModelSelection {
  config: ResolvedModelConfig
  modelId: ChatModelId
  provider: MainModelProvider
  role: ModelRole
  runtime: ChatModelRuntimeInfo
}

// 根据环境变量决定当前主模型使用 DeepSeek 还是 Ollama。
export function getMainModelProvider(): MainModelProvider {
  return process.env.MAIN_MODEL_PROVIDER?.trim().toLowerCase() === 'ollama'
    ? 'ollama'
    : 'deepseek'
}

// 解析指定 provider 和 role 最终生效的模型配置。
export function resolveProviderModelConfig(
  provider: MainModelProvider,
  role: ModelRole
): ResolvedModelConfig {
  const providerConfig = PROVIDER_CONFIG_BY_NAME[provider]
  const roleConfig = PROVIDER_ROLE_CONFIG_BY_NAME[provider][role]
  const rawBaseUrl =
    getStringEnv(providerConfig.baseUrlEnv) ?? providerConfig.defaultBaseUrl

  return {
    apiKey:
      getStringEnv(providerConfig.apiKeyEnv) ?? providerConfig.defaultApiKey,
    baseURL: providerConfig.normalizeBaseUrl
      ? providerConfig.normalizeBaseUrl(rawBaseUrl)
      : rawBaseUrl,
    model: getStringEnvWithFallback(
      roleConfig.modelEnv,
      roleConfig.defaultModel,
      roleConfig.fallbackModelEnv
    ),
    temperature: getNumberEnvWithFallback(
      roleConfig.temperatureEnv,
      DEFAULT_TEMPERATURE,
      roleConfig.fallbackTemperatureEnv
    ),
    maxTokens: getNumberEnvWithFallback(
      roleConfig.maxTokensEnv,
      DEFAULT_MAX_TOKENS,
      roleConfig.fallbackMaxTokensEnv
    ),
  }
}

// 生成指定 provider 和 role 对应的运行时展示信息。
function resolveProviderRuntimeInfo(
  provider: MainModelProvider,
  config: ResolvedModelConfig
): Omit<ChatModelRuntimeInfo, 'requestedModelId'> {
  const providerConfig = PROVIDER_CONFIG_BY_NAME[provider]

  return {
    actualModel: config.model,
    displayTarget: providerConfig.displayTarget,
    mode: providerConfig.mode,
    provider,
  }
}

// 解析一个聊天模型在当前环境下最终会命中的 provider、角色和运行时信息。
export function resolveChatModelSelection(
  modelId: ChatModelId
): ResolvedChatModelSelection {
  const provider = getMainModelProvider()
  const role = getChatModelRole(modelId)
  const config = resolveProviderModelConfig(provider, role)
  const runtime = {
    ...resolveProviderRuntimeInfo(provider, config),
    requestedModelId: modelId,
  }

  return {
    config,
    modelId,
    provider,
    role,
    runtime,
  }
}

// 获取聊天模型选项对应的运行时展示信息，供 UI 和日志使用。
export function getChatModelRuntimeInfo(
  modelId: ChatModelId
): ChatModelRuntimeInfo {
  return resolveChatModelSelection(modelId).runtime
}
