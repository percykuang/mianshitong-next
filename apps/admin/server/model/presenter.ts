import type {
  StoredChatModelConfigInput,
  StoredChatModelConfigSummary,
} from '@mianshitong/llm'
import { safeJsonStringify } from '@mianshitong/shared/runtime'

import { formatDateTime } from '@/server/shared/query'

import type {
  AdminChatModelListResult,
  ParsedAdminChatModelPayload,
} from './types'

type StoredChatModelStorageError =
  | 'disabled_default_model'
  | 'duplicate_id'
  | 'first_model_must_be_enabled'
  | 'last_enabled_model'
  | 'missing_secret'
  | 'not_found'

function toJsonEditorText(value: Record<string, unknown> | undefined) {
  if (!value) {
    return ''
  }

  const jsonText = safeJsonStringify(value, 2)
  return jsonText.error ? '' : jsonText.data
}

export function toAdminChatModelListResult(
  items: StoredChatModelConfigSummary[]
): AdminChatModelListResult {
  return {
    items: items.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description ?? '',
      provider: item.provider,
      baseUrl: item.baseUrl ?? '',
      apiKeyPreview: item.apiKeyPreview,
      model: item.model,
      enabled: item.enabled ?? true,
      isDefault: item.isDefault ?? false,
      sortOrder: item.sortOrder ?? 0,
      supportsJsonOutput: item.supportsJsonOutput ?? false,
      modelKwargsJson: toJsonEditorText(item.modelKwargs),
      jsonModelKwargsJson: toJsonEditorText(item.jsonModelKwargs),
      updatedAtLabel: formatDateTime(item.updatedAt),
    })),
  }
}

export function toStoredCreateModelInput(
  payload: ParsedAdminChatModelPayload
): StoredChatModelConfigInput {
  return {
    id: payload.id,
    label: payload.label,
    description: payload.description ?? undefined,
    provider: payload.provider,
    baseUrl: payload.baseUrl,
    apiKey: payload.apiKey ?? '',
    model: payload.model,
    enabled: payload.enabled,
    isDefault: payload.isDefault,
    sortOrder: payload.sortOrder,
    supportsJsonOutput: payload.supportsJsonOutput,
    modelKwargs: payload.modelKwargs ?? undefined,
    jsonModelKwargs: payload.jsonModelKwargs ?? undefined,
  }
}

export function mapAdminChatModelStorageError(
  error: StoredChatModelStorageError | null
) {
  if (error === 'duplicate_id') {
    return '模型 ID 已存在'
  }

  if (error === 'missing_secret') {
    return '未配置 MODEL_CONFIG_SECRET，无法安全保存模型密钥'
  }

  if (error === 'first_model_must_be_enabled') {
    return '第一条模型配置必须启用'
  }

  if (error === 'last_enabled_model') {
    return '至少需要保留一条启用中的模型配置'
  }

  if (error === 'disabled_default_model') {
    return '默认模型必须保持启用状态'
  }

  if (error === 'not_found') {
    return '模型配置不存在'
  }

  return '模型配置保存失败，请稍后重试'
}
