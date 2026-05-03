import 'server-only'

import { getChatModelCatalogItem, getDefaultChatModelId } from '../catalog'
import type { ModelProvider } from '../types'

export interface ModelConnectionConfig {
  apiKey: string | undefined
  baseURL: string
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
}

export interface ResolvedChatModelPlan {
  connection: ModelConnectionConfig
  modelId: string
  provider: ModelProvider
  supportsJsonOutput: boolean
}

function createEmptyModelCatalogError() {
  return new Error('model_catalog_empty')
}

export async function resolveChatModelPlan(
  modelId?: string
): Promise<ResolvedChatModelPlan> {
  const resolvedModelId = modelId ?? (await getDefaultChatModelId())
  const modelCatalogItem = await getChatModelCatalogItem(resolvedModelId)

  if (!modelCatalogItem) {
    throw createEmptyModelCatalogError()
  }

  return {
    modelId: modelCatalogItem.id,
    provider: modelCatalogItem.provider,
    supportsJsonOutput: modelCatalogItem.supportsJsonOutput,
    connection: {
      apiKey: modelCatalogItem.apiKey,
      baseURL: modelCatalogItem.baseUrl,
      jsonModelKwargs:
        modelCatalogItem.jsonModelKwargs ?? modelCatalogItem.modelKwargs,
      model: modelCatalogItem.model,
      modelKwargs: modelCatalogItem.modelKwargs,
    },
  }
}
