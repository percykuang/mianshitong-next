import {
  getChatModelOptions,
  getDefaultChatModelId,
  normalizeChatModelId,
} from '@mianshitong/llm'

import type { ChatModelCatalogState } from '@/chat/shared/model-catalog'

export const EMPTY_CHAT_MODEL_CATALOG_MESSAGE =
  '当前系统还没有可用模型，请联系管理员完成模型配置。'
export const ERROR_CHAT_MODEL_CATALOG_MESSAGE =
  '模型服务暂时不可用，请稍后重试。'

export type ResolvedChatModelCatalogState = Extract<
  ChatModelCatalogState,
  {
    status: 'empty' | 'error' | 'ready'
  }
>

export type ChatModelCatalogRuntimeError =
  | 'model_catalog_empty'
  | 'model_catalog_unavailable'

export async function getResolvedChatModelCatalogState(): Promise<ResolvedChatModelCatalogState> {
  try {
    const [models, defaultModelId] = await Promise.all([
      getChatModelOptions(),
      getDefaultChatModelId(),
    ])
    const selectedModelId = defaultModelId || models[0]?.id || ''

    if (models.length === 0 || !selectedModelId) {
      return {
        message: EMPTY_CHAT_MODEL_CATALOG_MESSAGE,
        models: [],
        selectedModelId: '',
        status: 'empty',
      }
    }

    return {
      message: '',
      models,
      selectedModelId,
      status: 'ready',
    }
  } catch {
    return {
      message: ERROR_CHAT_MODEL_CATALOG_MESSAGE,
      models: [],
      selectedModelId: '',
      status: 'error',
    }
  }
}

export async function resolveUsableChatModelId(
  modelId: string | null | undefined
): Promise<
  | {
      error: null
      modelId: string
    }
  | {
      error: ChatModelCatalogRuntimeError
      modelId: null
    }
> {
  try {
    const normalizedModelId = await normalizeChatModelId(modelId)

    return normalizedModelId
      ? {
          error: null,
          modelId: normalizedModelId,
        }
      : {
          error: 'model_catalog_empty',
          modelId: null,
        }
  } catch {
    return {
      error: 'model_catalog_unavailable',
      modelId: null,
    }
  }
}

export function toChatModelCatalogRuntimeError(
  error: unknown
): ChatModelCatalogRuntimeError {
  return error instanceof Error && error.message === 'model_catalog_empty'
    ? 'model_catalog_empty'
    : 'model_catalog_unavailable'
}

export function hasReadyChatModelCatalog(
  state: ChatModelCatalogState
): state is Extract<ChatModelCatalogState, { status: 'ready' }> {
  return (
    state.status === 'ready' &&
    state.models.length > 0 &&
    state.selectedModelId.trim().length > 0
  )
}
