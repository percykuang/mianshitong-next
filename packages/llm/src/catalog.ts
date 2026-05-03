import {
  getRuntimeChatModelCatalogItem,
  getRuntimeChatModelOptions,
  getRuntimeDefaultChatModelId,
  normalizeRuntimeChatModelId,
} from './model-config'

export async function getChatModelOptions() {
  return getRuntimeChatModelOptions()
}

export async function getDefaultChatModelId(): Promise<string> {
  return getRuntimeDefaultChatModelId()
}

export async function normalizeChatModelId(
  value: string | null | undefined
): Promise<string> {
  return normalizeRuntimeChatModelId(value)
}

export async function getChatModelCatalogItem(
  modelId: string | null | undefined
) {
  return getRuntimeChatModelCatalogItem(modelId)
}
