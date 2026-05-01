import {
  createStoredChatModelConfig,
  deleteStoredChatModelConfig,
  listStoredChatModelConfigSummaries,
  updateStoredChatModelConfig,
} from '@mianshitong/llm'
import 'server-only'

import {
  parseCreateAdminChatModelPayload,
  parseUpdateAdminChatModelPayload,
} from './payload'
import {
  mapAdminChatModelStorageError,
  toAdminChatModelListResult,
  toStoredCreateModelInput,
} from './presenter'
import type { AdminChatModelListResult } from './types'

export async function listAdminChatModels(): Promise<AdminChatModelListResult> {
  const items = await listStoredChatModelConfigSummaries()
  return toAdminChatModelListResult(items)
}

export async function createAdminChatModel(payload: unknown) {
  const parsed = parseCreateAdminChatModelPayload(payload)

  if (parsed.error) {
    return {
      error: parsed.error,
      ok: false as const,
      status: 400,
    }
  }

  const parsedData = parsed.data

  if (!parsedData) {
    return {
      error: '模型配置解析失败',
      ok: false as const,
      status: 400,
    }
  }

  const result = await createStoredChatModelConfig(
    toStoredCreateModelInput(parsedData)
  )

  if (result.error) {
    return {
      error: mapAdminChatModelStorageError(result.error),
      ok: false as const,
      status: result.error === 'duplicate_id' ? 409 : 400,
    }
  }

  return {
    error: null,
    ok: true as const,
  }
}

export async function updateAdminChatModel(modelId: string, payload: unknown) {
  const parsed = parseUpdateAdminChatModelPayload(modelId, payload)

  if (parsed.error) {
    return {
      error: parsed.error,
      ok: false as const,
      status: 400,
    }
  }

  const parsedData = parsed.data

  if (!parsedData) {
    return {
      error: '模型配置解析失败',
      ok: false as const,
      status: 400,
    }
  }

  const result = await updateStoredChatModelConfig(modelId, {
    label: parsedData.label,
    description: parsedData.description,
    provider: parsedData.provider,
    baseUrl: parsedData.baseUrl,
    apiKey: parsedData.apiKey,
    model: parsedData.model,
    enabled: parsedData.enabled,
    isDefault: parsedData.isDefault,
    sortOrder: parsedData.sortOrder,
    supportsJsonOutput: parsedData.supportsJsonOutput,
    modelKwargs: parsedData.modelKwargs,
    jsonModelKwargs: parsedData.jsonModelKwargs,
  })

  if (result.error) {
    return {
      error: mapAdminChatModelStorageError(result.error),
      ok: false as const,
      status: result.error === 'not_found' ? 404 : 400,
    }
  }

  return {
    error: null,
    ok: true as const,
  }
}

export async function deleteAdminChatModel(modelId: string) {
  const result = await deleteStoredChatModelConfig(modelId)

  if (result.error) {
    return {
      error: mapAdminChatModelStorageError(result.error),
      ok: false as const,
      status: result.error === 'not_found' ? 404 : 400,
    }
  }

  return {
    error: null,
    ok: true as const,
  }
}
