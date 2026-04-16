import type { ZodTypeAny } from 'zod'
import {
  getChatModelRole,
  getDefaultChatModelId,
  getDefaultChatModelIdForRole,
} from './catalog'
import { getChatModelInstance, getProviderRoleModelInstance } from './instance'
import { resolveChatModelSelection } from './runtime'
import { logModelSelection } from './utils'
import type { ChatModelId, ModelRole } from './types'

// 获取并记录指定聊天模型对应的实例。
function getLoggedChatModel(modelId: ChatModelId, label: string) {
  const selection = resolveChatModelSelection(modelId)
  logModelSelection(label, selection.runtime)
  return getChatModelInstance(modelId)
}

// 获取指定角色在当前主配置下对应的默认聊天模型实例。
function getDefaultRoleModel(role: ModelRole, label: string) {
  return getLoggedChatModel(getDefaultChatModelIdForRole(role), label)
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

// 获取聊天场景使用的模型实例，并记录当前选择日志。
export function getChatModel(modelId: ChatModelId = getDefaultChatModelId()) {
  return getLoggedChatModel(
    modelId,
    getChatModelRole(modelId) === 'reasoner'
      ? 'Using reasoning chat model'
      : 'Using balanced chat model'
  )
}

// 获取当前主模型配置对应的 chat 模型实例。
export function getMainModel() {
  return getDefaultRoleModel('chat', 'Using main model')
}

// 兼容旧调用方式，返回当前主模型实例。
export function getModel() {
  return getMainModel()
}

// 获取当前主模型配置对应的 reasoner 模型实例。
export function getReasonerModel() {
  return getDefaultRoleModel('reasoner', 'Using reasoner model')
}

// 基于当前主模型创建支持结构化输出的包装实例。
export function getStructuredModel<T extends ZodTypeAny>(schema: T) {
  return getMainModel().withStructuredOutput(schema, {
    method: 'functionCalling',
    includeRaw: false,
  })
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
