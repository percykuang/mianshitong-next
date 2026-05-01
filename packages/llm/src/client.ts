import type { Runnable } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { KeyedCache } from '@mianshitong/shared/runtime'
import { createHash } from 'node:crypto'

import { getChatModelCatalogItem, getDefaultChatModelId } from './catalog'
import type { ModelProvider } from './types'

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
  supportsJsonOutput: boolean
}

interface ModelConnectionConfig {
  apiKey: string | undefined
  baseURL: string
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
}

const PROVIDER_CONFIG_BY_NAME: Record<ModelProvider, ProviderConfig> = {
  deepseek: {
    supportsJsonOutput: true,
  },
  ollama: {
    supportsJsonOutput: false,
  },
  'openai-compatible': {
    supportsJsonOutput: false,
  },
}

function createEmptyModelCatalogError() {
  return new Error('model_catalog_empty')
}

function buildModelClientCacheKey(input: {
  apiKey?: string
  baseURL: string
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}) {
  return [
    input.provider,
    input.baseURL,
    createHash('sha256')
      .update(input.apiKey ?? '')
      .digest('hex'),
    input.model,
    JSON.stringify(input.modelKwargs ?? {}),
  ].join(':')
}

async function resolveChatModelConfig(modelId: string) {
  const modelCatalogItem = await getChatModelCatalogItem(modelId)

  if (!modelCatalogItem) {
    throw createEmptyModelCatalogError()
  }

  const providerConfig = PROVIDER_CONFIG_BY_NAME[modelCatalogItem.provider]

  return {
    modelId: modelCatalogItem.id,
    provider: modelCatalogItem.provider,
    supportsJsonOutput:
      modelCatalogItem.supportsJsonOutput ?? providerConfig.supportsJsonOutput,
    connection: {
      apiKey: modelCatalogItem.apiKey,
      baseURL: modelCatalogItem.baseUrl ?? '',
      jsonModelKwargs:
        modelCatalogItem.jsonModelKwargs ?? modelCatalogItem.modelKwargs,
      model: modelCatalogItem.model,
      modelKwargs: modelCatalogItem.modelKwargs,
    },
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
    apiKey: input.connection.apiKey,
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
export async function getChatModel(modelId?: string) {
  const plan = resolveChatModelConfig(
    modelId ?? (await getDefaultChatModelId())
  )
  const resolvedPlan = await plan

  return getOrCreateModelClient({
    connection: resolvedPlan.connection,
    provider: resolvedPlan.provider,
  })
}

export async function getJsonChatModel(modelId?: string) {
  const plan = await resolveChatModelConfig(
    modelId ?? (await getDefaultChatModelId())
  )

  if (!plan.supportsJsonOutput) {
    return getOrCreateModelClient({
      connection: plan.connection,
      provider: plan.provider,
    })
  }

  const cacheKey = `${buildModelClientCacheKey({
    provider: plan.provider,
    baseURL: plan.connection.baseURL,
    apiKey: plan.connection.apiKey,
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
