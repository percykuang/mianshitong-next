import type { Runnable } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { KeyedCache } from '@mianshitong/shared/runtime'

import { getChatModelCatalogItem, getDefaultChatModelId } from './catalog'
import { normalizeOpenAICompatibleBaseUrl, readEnvString } from './env'
import type { ChatModelId, ModelProvider } from './types'

const modelClientCache = new KeyedCache<string, ChatOpenAI>()
const jsonModelClientCache = new KeyedCache<
  string,
  Runnable<
    Parameters<ChatOpenAI['invoke']>[0],
    Awaited<ReturnType<ChatOpenAI['invoke']>>
  >
>()

export type ChatModelClient = ChatOpenAI

interface ProviderConfig {
  apiKeyEnv: string
  baseUrlEnv: string
  defaultApiKey?: string
  defaultBaseUrl: string
  modelEnv: string
  normalizeBaseUrl?: (baseUrl: string) => string
  supportsJsonOutput: boolean
}

interface ModelConnectionConfig {
  apiKey: string | undefined
  baseURL: string
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
}

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434'
const DEFAULT_OLLAMA_API_KEY = 'ollama'
const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

const PROVIDER_CONFIG_BY_NAME: Record<ModelProvider, ProviderConfig> = {
  deepseek: {
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseUrlEnv: 'DEEPSEEK_BASE_URL',
    defaultBaseUrl: DEFAULT_DEEPSEEK_BASE_URL,
    modelEnv: 'DEEPSEEK_MODEL',
    supportsJsonOutput: true,
  },
  ollama: {
    apiKeyEnv: 'OLLAMA_API_KEY',
    baseUrlEnv: 'OLLAMA_BASE_URL',
    defaultApiKey: DEFAULT_OLLAMA_API_KEY,
    defaultBaseUrl: DEFAULT_OLLAMA_BASE_URL,
    modelEnv: 'OLLAMA_MODEL',
    normalizeBaseUrl: normalizeOpenAICompatibleBaseUrl,
    supportsJsonOutput: false,
  },
}

function buildModelClientCacheKey(input: {
  baseURL: string
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}) {
  return [
    input.provider,
    input.baseURL,
    input.model,
    JSON.stringify(input.modelKwargs ?? {}),
  ].join(':')
}

function resolveModelConnection(input: {
  defaultModel: string
  jsonModelKwargs?: Record<string, unknown>
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}): ModelConnectionConfig {
  const providerConfig = PROVIDER_CONFIG_BY_NAME[input.provider]
  const rawBaseUrl =
    readEnvString(providerConfig.baseUrlEnv) ?? providerConfig.defaultBaseUrl

  return {
    apiKey:
      readEnvString(providerConfig.apiKeyEnv) ?? providerConfig.defaultApiKey,
    baseURL: providerConfig.normalizeBaseUrl
      ? providerConfig.normalizeBaseUrl(rawBaseUrl)
      : rawBaseUrl,
    jsonModelKwargs: input.jsonModelKwargs ?? input.modelKwargs,
    model: readEnvString(providerConfig.modelEnv) ?? input.defaultModel,
    modelKwargs: input.modelKwargs,
  }
}

function resolveChatModelConfig(modelId: ChatModelId) {
  const modelCatalogItem = getChatModelCatalogItem(modelId)
  const providerConfig = PROVIDER_CONFIG_BY_NAME[modelCatalogItem.provider]

  return {
    modelId: modelCatalogItem.id,
    provider: modelCatalogItem.provider,
    supportsJsonOutput: providerConfig.supportsJsonOutput,
    connection: resolveModelConnection({
      defaultModel: modelCatalogItem.model,
      jsonModelKwargs: modelCatalogItem.jsonModelKwargs,
      modelKwargs: modelCatalogItem.modelKwargs,
      provider: modelCatalogItem.provider,
    }),
  }
}

function createModelClient(
  connection: ModelConnectionConfig,
  modelKwargs = connection.modelKwargs
) {
  return new ChatOpenAI({
    model: connection.model,
    apiKey: connection.apiKey,
    modelKwargs,
    configuration: {
      baseURL: connection.baseURL,
    },
  })
}

function getOrCreateModelClient(input: {
  connection: ModelConnectionConfig
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}) {
  const cacheKey = buildModelClientCacheKey({
    provider: input.provider,
    baseURL: input.connection.baseURL,
    model: input.connection.model,
    modelKwargs: input.modelKwargs ?? input.connection.modelKwargs,
  })

  return modelClientCache.getOrCreate(cacheKey, () =>
    createModelClient(input.connection, input.modelKwargs)
  )
}

/**
 * 按业务层使用的聊天模型 ID 获取模型客户端。
 * 当前项目使用同一模型同时负责普通聊天与结构化输出。
 */
export function getChatModel(modelId: ChatModelId = getDefaultChatModelId()) {
  const plan = resolveChatModelConfig(modelId)
  return getOrCreateModelClient({
    connection: plan.connection,
    provider: plan.provider,
  })
}

export function getJsonChatModel(
  modelId: ChatModelId = getDefaultChatModelId()
) {
  const plan = resolveChatModelConfig(modelId)

  if (!plan.supportsJsonOutput) {
    return getOrCreateModelClient({
      connection: plan.connection,
      provider: plan.provider,
    })
  }

  const cacheKey = `${buildModelClientCacheKey({
    provider: plan.provider,
    baseURL: plan.connection.baseURL,
    model: plan.connection.model,
    modelKwargs: plan.connection.jsonModelKwargs,
  })}:json_object`

  return jsonModelClientCache.getOrCreate(cacheKey, () =>
    getOrCreateModelClient({
      connection: plan.connection,
      modelKwargs: plan.connection.jsonModelKwargs,
      provider: plan.provider,
    }).withConfig({
      response_format: {
        type: 'json_object',
      },
    })
  )
}
