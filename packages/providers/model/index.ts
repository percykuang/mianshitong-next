import type { ZodTypeAny } from 'zod'

import { getDefaultChatModelId, getDefaultChatModelIdForRole } from './catalog'
import {
  createDirectModelInstance,
  getChatModelInstance,
  getProviderRoleModelInstance,
} from './instance'
import { getMainModelProvider, resolveDirectModelSelection } from './runtime'
import type { ChatModelId, ModelRole } from './types'

function getDefaultRoleModel(role: ModelRole) {
  return getChatModelInstance(getDefaultChatModelIdForRole(role))
}

// 获取固定映射到 DeepSeek chat 角色的模型实例。
export function getDeepSeekModel() {
  return getProviderRoleModelInstance('deepseek', 'chat')
}

// 获取固定映射到 DeepSeek reasoner 角色的模型实例。
export function getDeepSeekReasonerModel() {
  return getProviderRoleModelInstance('deepseek', 'reasoner')
}

// 获取固定映射到 Ollama chat 角色的模型实例。
export function getOllamaModel() {
  return getProviderRoleModelInstance('ollama', 'chat')
}

// 获取固定映射到 Ollama reasoner 角色的模型实例。
export function getOllamaReasonerModel() {
  return getProviderRoleModelInstance('ollama', 'reasoner')
}

// 获取聊天场景使用的模型实例。
export function getChatModel(modelId: ChatModelId = getDefaultChatModelId()) {
  return getChatModelInstance(modelId)
}

// 获取当前主模型配置对应的 chat 模型实例。
export function getMainModel() {
  return getDefaultRoleModel('chat')
}

// 兼容旧调用方式，返回当前主模型实例。
export function getModel() {
  return getMainModel()
}

// 获取当前主模型配置对应的 reasoner 模型实例。
export function getReasonerModel() {
  return getDefaultRoleModel('reasoner')
}

// 基于当前主模型创建支持结构化输出的包装实例。
export function getStructuredModel<T extends ZodTypeAny>(schema: T) {
  return getMainModel().withStructuredOutput(schema, {
    method: 'functionCalling',
    includeRaw: false,
  })
}

export function getCareerRouterModel() {
  const selection = resolveDirectModelSelection({
    defaultModel: 'deepseek-chat',
    envName: 'CAREER_ROUTER_MODEL',
    fallbackEnvName:
      getMainModelProvider() === 'ollama'
        ? 'OLLAMA_CAREER_ROUTER_MODEL'
        : 'DEEPSEEK_CAREER_ROUTER_MODEL',
  })

  return createDirectModelInstance(selection.config)
}

// 当前主模型 provider 名称，便于外层逻辑判断。
export {
  getChatModelCatalog,
  getChatModelOptions,
  getDefaultChatModelId,
  isChatModelId,
  normalizeChatModelId,
} from './catalog'
export { getMainModelProvider } from './runtime'
export { getChatModelRuntimeInfo } from './runtime'

export type {
  ChatModelId,
  ChatModelOption,
  ChatModelRuntimeInfo,
  MainModelProvider,
} from './types'
