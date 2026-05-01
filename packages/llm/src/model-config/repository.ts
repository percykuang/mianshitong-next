import { prisma } from '@mianshitong/db'
import { Prisma } from '@prisma/client'

import type {
  StoredChatModelConfigInput,
  StoredChatModelConfigSummary,
} from '../types'
import { decryptApiKey, maskApiKey } from './crypto'
import {
  DEFAULT_ENABLED_MODEL_FALLBACK_ORDER_BY,
  ENABLED_RUNTIME_CHAT_MODEL_ORDER_BY,
  STORED_CHAT_MODEL_ORDER_BY,
} from './ordering'
import {
  type StoredRuntimeChatModelConfig,
  fromDbProvider,
  resolveConfiguredBaseUrl,
  toDbProvider,
} from './provider-config'

export type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export interface StoredChatModelConfigUpdateInput {
  apiKey?: string
  baseUrl?: string
  description?: string | null
  enabled?: boolean
  isDefault?: boolean
  jsonModelKwargs?: Record<string, unknown> | null
  label?: string
  model?: string
  modelKwargs?: Record<string, unknown> | null
  provider?: StoredChatModelConfigInput['provider']
  sortOrder?: number
  supportsJsonOutput?: boolean
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeJsonObject(
  value: unknown
): Record<string, unknown> | undefined {
  return isPlainObject(value) ? value : undefined
}

function toPrismaJsonValue(
  value: Record<string, unknown> | null | undefined
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === null) {
    return Prisma.JsonNull
  }

  return value as Prisma.InputJsonValue | undefined
}

export async function listStoredChatModelConfigRows() {
  return prisma.chatModelConfig.findMany({
    orderBy: STORED_CHAT_MODEL_ORDER_BY,
  })
}

export async function listEnabledStoredChatModelConfigRows() {
  return prisma.chatModelConfig.findMany({
    where: {
      enabled: true,
    },
    orderBy: ENABLED_RUNTIME_CHAT_MODEL_ORDER_BY,
  })
}

export async function ensureDefaultEnabledModel(tx: PrismaTransactionClient) {
  const existingDefault = await tx.chatModelConfig.findFirst({
    where: {
      enabled: true,
      isDefault: true,
    },
    select: {
      id: true,
    },
  })

  if (existingDefault) {
    return
  }

  const fallbackModel = await tx.chatModelConfig.findFirst({
    where: {
      enabled: true,
    },
    orderBy: DEFAULT_ENABLED_MODEL_FALLBACK_ORDER_BY,
    select: {
      id: true,
    },
  })

  if (!fallbackModel) {
    return
  }

  await tx.chatModelConfig.update({
    where: {
      id: fallbackModel.id,
    },
    data: {
      isDefault: true,
    },
  })
}

export async function hasAnyStoredChatModelConfig() {
  const count = await prisma.chatModelConfig.count()
  return count > 0
}

export function toStoredSummary(
  row: Awaited<ReturnType<typeof listStoredChatModelConfigRows>>[number]
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

export function toStoredRuntimeConfig(
  row: Awaited<ReturnType<typeof listEnabledStoredChatModelConfigRows>>[number]
): StoredRuntimeChatModelConfig | null {
  const apiKeyResult = decryptApiKey(row.apiKeyCiphertext)

  if (apiKeyResult.error) {
    return null
  }

  return {
    id: row.id,
    label: row.label,
    description: row.description ?? undefined,
    provider: fromDbProvider(row.provider),
    baseUrl: resolveConfiguredBaseUrl({
      baseUrl: row.baseUrl,
      provider: fromDbProvider(row.provider),
    }),
    apiKey: apiKeyResult.apiKey,
    model: row.model,
    enabled: row.enabled,
    isDefault: row.isDefault,
    sortOrder: row.sortOrder,
    supportsJsonOutput: row.supportsJsonOutput,
    modelKwargs: normalizeJsonObject(row.modelKwargs),
    jsonModelKwargs: normalizeJsonObject(row.jsonModelKwargs),
  }
}

export async function findStoredChatModelConfigById(modelId: string) {
  return prisma.chatModelConfig.findUnique({
    where: {
      id: modelId,
    },
  })
}

export async function findStoredChatModelConfigMetaById(modelId: string) {
  return prisma.chatModelConfig.findUnique({
    where: {
      id: modelId,
    },
    select: {
      id: true,
      enabled: true,
      isDefault: true,
    },
  })
}

export async function countStoredChatModels(tx: PrismaTransactionClient) {
  return tx.chatModelConfig.count()
}

export async function countEnabledStoredChatModels(
  tx: PrismaTransactionClient
) {
  return tx.chatModelConfig.count({
    where: {
      enabled: true,
    },
  })
}

export async function hasEnabledDefaultStoredChatModel(
  tx: PrismaTransactionClient
) {
  const defaultModel = await tx.chatModelConfig.findFirst({
    where: {
      enabled: true,
      isDefault: true,
    },
    select: {
      id: true,
    },
  })

  return !!defaultModel
}

export async function clearDefaultStoredChatModels(
  tx: PrismaTransactionClient,
  excludeModelId?: string
) {
  await tx.chatModelConfig.updateMany({
    where: {
      isDefault: true,
      ...(excludeModelId
        ? {
            id: {
              not: excludeModelId,
            },
          }
        : {}),
    },
    data: {
      isDefault: false,
    },
  })
}

export async function createStoredChatModelRow(
  tx: PrismaTransactionClient,
  input: StoredChatModelConfigInput & {
    apiKeyCiphertext: string
  }
) {
  return tx.chatModelConfig.create({
    data: {
      id: input.id,
      label: input.label,
      description: input.description,
      provider: toDbProvider(input.provider),
      baseUrl: input.baseUrl,
      apiKeyCiphertext: input.apiKeyCiphertext,
      apiKeyPreview: maskApiKey(input.apiKey),
      model: input.model,
      enabled: input.enabled,
      isDefault: input.isDefault,
      sortOrder: input.sortOrder,
      supportsJsonOutput: input.supportsJsonOutput,
      modelKwargs: toPrismaJsonValue(input.modelKwargs),
      jsonModelKwargs: toPrismaJsonValue(input.jsonModelKwargs),
    },
  })
}

export function buildStoredChatModelUpdateData(
  input: StoredChatModelConfigUpdateInput & {
    apiKeyCiphertext?: string
  }
) {
  return {
    ...(typeof input.label === 'string' ? { label: input.label } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(typeof input.provider === 'string'
      ? { provider: toDbProvider(input.provider) }
      : {}),
    ...(typeof input.baseUrl === 'string' ? { baseUrl: input.baseUrl } : {}),
    ...(typeof input.model === 'string' ? { model: input.model } : {}),
    ...(typeof input.enabled === 'boolean' ? { enabled: input.enabled } : {}),
    ...(typeof input.isDefault === 'boolean'
      ? { isDefault: input.isDefault }
      : {}),
    ...(typeof input.sortOrder === 'number'
      ? { sortOrder: input.sortOrder }
      : {}),
    ...(typeof input.supportsJsonOutput === 'boolean'
      ? { supportsJsonOutput: input.supportsJsonOutput }
      : {}),
    ...(input.modelKwargs !== undefined
      ? { modelKwargs: toPrismaJsonValue(input.modelKwargs) }
      : {}),
    ...(input.jsonModelKwargs !== undefined
      ? { jsonModelKwargs: toPrismaJsonValue(input.jsonModelKwargs) }
      : {}),
    ...(input.apiKeyCiphertext
      ? {
          apiKeyCiphertext: input.apiKeyCiphertext,
          apiKeyPreview: maskApiKey(input.apiKey ?? ''),
        }
      : {}),
  } satisfies Prisma.ChatModelConfigUpdateInput
}

export async function updateStoredChatModelRow(
  tx: PrismaTransactionClient,
  modelId: string,
  input: StoredChatModelConfigUpdateInput & {
    apiKeyCiphertext?: string
  }
) {
  return tx.chatModelConfig.update({
    where: {
      id: modelId,
    },
    data: buildStoredChatModelUpdateData(input),
  })
}

export async function deleteStoredChatModelRow(
  tx: PrismaTransactionClient,
  modelId: string
) {
  return tx.chatModelConfig.delete({
    where: {
      id: modelId,
    },
  })
}
