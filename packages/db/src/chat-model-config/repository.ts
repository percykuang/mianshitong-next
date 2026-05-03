import { Prisma } from '@prisma/client'

import type { DbClient } from '../client-types'
import type {
  DbChatModelConfigCreateInput,
  DbChatModelConfigMetaRow,
  DbChatModelConfigUpdateInput,
  DbStoredChatModelConfigRow,
  DbStoredEnabledChatModelConfigRow,
} from './types'

const CHAT_MODEL_STABLE_ORDER_BY = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' },
] satisfies Prisma.ChatModelConfigOrderByWithRelationInput[]

const ENABLED_RUNTIME_CHAT_MODEL_ORDER_BY = [
  { isDefault: 'desc' },
  ...CHAT_MODEL_STABLE_ORDER_BY,
] satisfies Prisma.ChatModelConfigOrderByWithRelationInput[]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function toPrismaJsonValue(
  value: Record<string, unknown> | null | undefined
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === null) {
    return Prisma.JsonNull
  }

  return isPlainObject(value) ? (value as Prisma.InputJsonValue) : undefined
}

function buildChatModelConfigUpdateData(input: DbChatModelConfigUpdateInput) {
  return {
    ...(typeof input.label === 'string' ? { label: input.label } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(typeof input.provider === 'string' ? { provider: input.provider } : {}),
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
          apiKeyPreview: input.apiKeyPreview ?? '',
        }
      : {}),
  } satisfies Prisma.ChatModelConfigUpdateInput
}

function listChatModelConfigRows(
  client: DbClient
): Promise<DbStoredChatModelConfigRow[]> {
  return client.chatModelConfig.findMany({
    orderBy: CHAT_MODEL_STABLE_ORDER_BY,
  })
}

function listEnabledChatModelConfigRows(
  client: DbClient
): Promise<DbStoredEnabledChatModelConfigRow[]> {
  return client.chatModelConfig.findMany({
    where: {
      enabled: true,
    },
    orderBy: ENABLED_RUNTIME_CHAT_MODEL_ORDER_BY,
  })
}

function findChatModelConfigById(
  client: DbClient,
  modelId: string
): Promise<DbStoredChatModelConfigRow | null> {
  return client.chatModelConfig.findUnique({
    where: {
      id: modelId,
    },
  })
}

function findChatModelConfigMetaById(
  client: DbClient,
  modelId: string
): Promise<DbChatModelConfigMetaRow> {
  return client.chatModelConfig.findUnique({
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

function countChatModelConfigs(client: DbClient) {
  return client.chatModelConfig.count()
}

function countEnabledChatModelConfigs(client: DbClient) {
  return client.chatModelConfig.count({
    where: {
      enabled: true,
    },
  })
}

function countOtherEnabledChatModelConfigs(client: DbClient, modelId: string) {
  return client.chatModelConfig.count({
    where: {
      enabled: true,
      id: {
        not: modelId,
      },
    },
  })
}

async function hasEnabledDefaultChatModel(client: DbClient) {
  const defaultModel = await client.chatModelConfig.findFirst({
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

async function clearDefaultChatModelConfigs(
  client: DbClient,
  excludeModelId?: string
) {
  await client.chatModelConfig.updateMany({
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

async function ensureDefaultEnabledChatModel(client: DbClient) {
  const existingDefault = await client.chatModelConfig.findFirst({
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

  const fallbackModel = await client.chatModelConfig.findFirst({
    where: {
      enabled: true,
    },
    orderBy: CHAT_MODEL_STABLE_ORDER_BY,
    select: {
      id: true,
    },
  })

  if (!fallbackModel) {
    return
  }

  await client.chatModelConfig.update({
    where: {
      id: fallbackModel.id,
    },
    data: {
      isDefault: true,
    },
  })
}

function createChatModelConfigRow(
  client: DbClient,
  input: DbChatModelConfigCreateInput
): Promise<DbStoredChatModelConfigRow> {
  return client.chatModelConfig.create({
    data: {
      id: input.id,
      label: input.label,
      description: input.description,
      provider: input.provider,
      baseUrl: input.baseUrl,
      apiKeyCiphertext: input.apiKeyCiphertext,
      apiKeyPreview: input.apiKeyPreview,
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

function updateChatModelConfigRow(
  client: DbClient,
  modelId: string,
  input: DbChatModelConfigUpdateInput
): Promise<DbStoredChatModelConfigRow> {
  return client.chatModelConfig.update({
    where: {
      id: modelId,
    },
    data: buildChatModelConfigUpdateData(input),
  })
}

function deleteChatModelConfigRow(
  client: DbClient,
  modelId: string
): Promise<DbStoredChatModelConfigRow> {
  return client.chatModelConfig.delete({
    where: {
      id: modelId,
    },
  })
}

export function createChatModelConfigDb(client: DbClient) {
  return {
    list() {
      return listChatModelConfigRows(client)
    },
    listEnabled() {
      return listEnabledChatModelConfigRows(client)
    },
    findById(modelId: string) {
      return findChatModelConfigById(client, modelId)
    },
    findMetaById(modelId: string) {
      return findChatModelConfigMetaById(client, modelId)
    },
    count() {
      return countChatModelConfigs(client)
    },
    countEnabled() {
      return countEnabledChatModelConfigs(client)
    },
    countOtherEnabled(modelId: string) {
      return countOtherEnabledChatModelConfigs(client, modelId)
    },
    hasEnabledDefault() {
      return hasEnabledDefaultChatModel(client)
    },
    clearDefault(excludeModelId?: string) {
      return clearDefaultChatModelConfigs(client, excludeModelId)
    },
    ensureDefaultEnabled() {
      return ensureDefaultEnabledChatModel(client)
    },
    create(input: DbChatModelConfigCreateInput) {
      return createChatModelConfigRow(client, input)
    },
    update(modelId: string, input: DbChatModelConfigUpdateInput) {
      return updateChatModelConfigRow(client, modelId, input)
    },
    delete(modelId: string) {
      return deleteChatModelConfigRow(client, modelId)
    },
  }
}

export type ChatModelConfigDb = ReturnType<typeof createChatModelConfigDb>
