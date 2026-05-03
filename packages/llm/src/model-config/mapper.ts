import {
  type DbChatModelConfigCreateInput,
  type DbChatModelConfigUpdateInput,
  type DbStoredChatModelConfigRow,
  type DbStoredEnabledChatModelConfigRow,
} from '@mianshitong/db'

import type {
  ChatModelOption,
  StoredChatModelConfigInput,
  StoredChatModelConfigSummary,
} from '../types'
import { decryptApiKey, maskApiKey } from './crypto'
import {
  fromDbProvider,
  resolveConfiguredBaseUrl,
  toDbProvider,
} from './provider'
import type {
  RuntimeChatModelConfig,
  StoredChatModelConfigUpdateInput,
} from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeJsonObject(
  value: unknown
): Record<string, unknown> | undefined {
  return isPlainObject(value) ? value : undefined
}

function decryptRuntimeApiKey(ciphertext: string) {
  const result = decryptApiKey(ciphertext)

  return result.error ? null : result.apiKey
}

export function toStoredSummary(
  row: DbStoredChatModelConfigRow
): StoredChatModelConfigSummary {
  return {
    id: row.id,
    label: row.label,
    description: row.description ?? undefined,
    provider: fromDbProvider(row.provider),
    baseUrl: row.baseUrl,
    apiKeyPreview: row.apiKeyPreview,
    model: row.model,
    enabled: row.enabled,
    isDefault: row.isDefault,
    sortOrder: row.sortOrder,
    supportsJsonOutput: row.supportsJsonOutput,
    modelKwargs: normalizeJsonObject(row.modelKwargs),
    jsonModelKwargs: normalizeJsonObject(row.jsonModelKwargs),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function toRuntimeChatModelConfig(
  row: DbStoredEnabledChatModelConfigRow
): RuntimeChatModelConfig | null {
  const apiKey = decryptRuntimeApiKey(row.apiKeyCiphertext)

  if (!apiKey) {
    return null
  }

  const provider = fromDbProvider(row.provider)

  return {
    id: row.id,
    label: row.label,
    description: row.description ?? undefined,
    provider,
    baseUrl: resolveConfiguredBaseUrl({
      baseUrl: row.baseUrl,
      provider,
    }),
    apiKey,
    model: row.model,
    enabled: row.enabled,
    isDefault: row.isDefault,
    sortOrder: row.sortOrder,
    supportsJsonOutput: row.supportsJsonOutput,
    modelKwargs: normalizeJsonObject(row.modelKwargs),
    jsonModelKwargs: normalizeJsonObject(row.jsonModelKwargs),
  }
}

export function toChatModelOption(
  config: RuntimeChatModelConfig
): ChatModelOption {
  return {
    id: config.id,
    label: config.label,
    description: config.description,
  }
}

export function toDbCreateInput(input: {
  apiKeyCiphertext: string
  isDefault: boolean
  model: StoredChatModelConfigInput
}): DbChatModelConfigCreateInput {
  return {
    id: input.model.id,
    label: input.model.label,
    description: input.model.description,
    provider: toDbProvider(input.model.provider),
    baseUrl: input.model.baseUrl,
    apiKeyCiphertext: input.apiKeyCiphertext,
    apiKeyPreview: maskApiKey(input.model.apiKey),
    model: input.model.model,
    enabled: input.model.enabled,
    isDefault: input.isDefault,
    sortOrder: input.model.sortOrder,
    supportsJsonOutput: input.model.supportsJsonOutput,
    modelKwargs: input.model.modelKwargs,
    jsonModelKwargs: input.model.jsonModelKwargs,
  }
}

export function toDbUpdateInput(input: {
  apiKeyCiphertext?: string
  model: StoredChatModelConfigUpdateInput
}): DbChatModelConfigUpdateInput {
  return {
    label: input.model.label,
    description: input.model.description,
    provider: input.model.provider
      ? toDbProvider(input.model.provider)
      : undefined,
    baseUrl: input.model.baseUrl,
    model: input.model.model,
    enabled: input.model.enabled,
    isDefault: input.model.isDefault,
    sortOrder: input.model.sortOrder,
    supportsJsonOutput: input.model.supportsJsonOutput,
    modelKwargs: input.model.modelKwargs,
    jsonModelKwargs: input.model.jsonModelKwargs,
    apiKeyCiphertext: input.apiKeyCiphertext,
    apiKeyPreview:
      input.apiKeyCiphertext && input.model.apiKey
        ? maskApiKey(input.model.apiKey)
        : undefined,
  }
}
