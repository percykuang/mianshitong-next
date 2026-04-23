import { ChatOpenAI } from '@langchain/openai'

import {
  type ResolvedModelConfig,
  resolveChatModelSelection,
  resolveProviderModelConfig,
} from './runtime'
import type { ChatModelId, MainModelProvider, ModelRole } from './types'
import { createModelInstanceCacheKey } from './utils'

const modelInstanceCache = new Map<string, ChatOpenAI>()

// 按解析后的配置创建一个新的 ChatOpenAI 实例。
function createModelInstance(resolvedConfig: ResolvedModelConfig) {
  return new ChatOpenAI({
    model: resolvedConfig.model,
    apiKey: resolvedConfig.apiKey,
    temperature: resolvedConfig.temperature,
    maxTokens: resolvedConfig.maxTokens,
    configuration: {
      baseURL: resolvedConfig.baseURL,
    },
  })
}

export function createDirectModelInstance(resolvedConfig: ResolvedModelConfig) {
  return createModelInstance(resolvedConfig)
}

// 获取缓存中的模型实例，没有则按当前配置创建并写入缓存。
export function getProviderRoleModelInstance(
  provider: MainModelProvider,
  role: ModelRole
) {
  const cacheKey = createModelInstanceCacheKey(provider, role)
  const cachedModel = modelInstanceCache.get(cacheKey)

  if (cachedModel) {
    return cachedModel
  }

  const model = createModelInstance(resolveProviderModelConfig(provider, role))
  modelInstanceCache.set(cacheKey, model)
  return model
}

// 根据聊天模型 id 获取当前生效 provider 下的模型实例。
export function getChatModelInstance(modelId: ChatModelId) {
  const selection = resolveChatModelSelection(modelId)

  return getProviderRoleModelInstance(selection.provider, selection.role)
}
