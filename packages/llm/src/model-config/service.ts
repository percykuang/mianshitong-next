import { prisma } from '@mianshitong/db'
import 'server-only'

import type {
  ChatModelOption,
  StoredChatModelConfigInput,
  StoredChatModelConfigSummary,
} from '../types'
import { encryptApiKey } from './crypto'
import { type StoredRuntimeChatModelConfig } from './provider-config'
import {
  type PrismaTransactionClient,
  type StoredChatModelConfigUpdateInput,
  clearDefaultStoredChatModels,
  countEnabledStoredChatModels,
  countStoredChatModels,
  createStoredChatModelRow,
  deleteStoredChatModelRow,
  ensureDefaultEnabledModel,
  findStoredChatModelConfigById,
  findStoredChatModelConfigMetaById,
  hasEnabledDefaultStoredChatModel,
  listEnabledStoredChatModelConfigRows,
  listStoredChatModelConfigRows,
  toStoredRuntimeConfig,
  toStoredSummary,
  updateStoredChatModelRow,
} from './repository'

async function runStoredChatModelTransaction<T>(
  handler: (tx: PrismaTransactionClient) => Promise<T>
) {
  return prisma.$transaction((tx) => handler(tx))
}

export async function listStoredChatModelConfigSummaries(): Promise<
  StoredChatModelConfigSummary[]
> {
  const rows = await listStoredChatModelConfigRows()
  return rows.map(toStoredSummary)
}

export async function getRuntimeChatModelCatalog(): Promise<
  StoredRuntimeChatModelConfig[]
> {
  const rows = await listEnabledStoredChatModelConfigRows()
  return rows
    .map(toStoredRuntimeConfig)
    .filter(
      (
        config: StoredRuntimeChatModelConfig | null
      ): config is StoredRuntimeChatModelConfig => config !== null
    )
}

export async function getRuntimeChatModelOptions(): Promise<ChatModelOption[]> {
  return (await getRuntimeChatModelCatalog()).map(
    ({
      id,
      label,
      description,
    }: StoredRuntimeChatModelConfig): ChatModelOption => ({
      id,
      label,
      description,
    })
  )
}

export async function getRuntimeDefaultChatModelId(): Promise<string> {
  const catalog = await getRuntimeChatModelCatalog()
  return catalog.find((item) => item.isDefault)?.id ?? catalog[0]?.id ?? ''
}

export async function normalizeRuntimeChatModelId(
  value: string | null | undefined
): Promise<string> {
  const catalog = await getRuntimeChatModelCatalog()
  const matchedModel = catalog.find(
    (item: StoredRuntimeChatModelConfig) => item.id === value
  )

  return (
    matchedModel?.id ??
    catalog.find((item: StoredRuntimeChatModelConfig) => item.isDefault)?.id ??
    catalog[0]?.id ??
    ''
  )
}

export async function getRuntimeChatModelCatalogItem(
  modelId: string | null | undefined
): Promise<StoredRuntimeChatModelConfig | null> {
  const catalog = await getRuntimeChatModelCatalog()
  const normalizedModelId = await normalizeRuntimeChatModelId(modelId)

  return (
    catalog.find(
      (item: StoredRuntimeChatModelConfig) => item.id === normalizedModelId
    ) ??
    catalog.find((item: StoredRuntimeChatModelConfig) => item.isDefault) ??
    catalog[0] ??
    null
  )
}

export async function createStoredChatModelConfig(
  input: StoredChatModelConfigInput
) {
  const encryptedApiKey = encryptApiKey(input.apiKey)

  if (encryptedApiKey.error) {
    return {
      error: 'missing_secret' as const,
      model: null,
    }
  }

  try {
    const result = await runStoredChatModelTransaction(async (tx) => {
      const modelCount = await countStoredChatModels(tx)
      const enabledCount = await countEnabledStoredChatModels(tx)

      if (!input.enabled && modelCount === 0) {
        return {
          error: 'first_model_must_be_enabled' as const,
          model: null,
        }
      }

      if (!input.enabled && enabledCount === 0) {
        return {
          error: 'last_enabled_model' as const,
          model: null,
        }
      }

      const shouldSetDefault =
        input.isDefault ||
        (input.enabled && !(await hasEnabledDefaultStoredChatModel(tx)))

      if (shouldSetDefault) {
        await clearDefaultStoredChatModels(tx)
      }

      const created = await createStoredChatModelRow(tx, {
        ...input,
        apiKeyCiphertext: encryptedApiKey.ciphertext,
        isDefault: shouldSetDefault,
      })

      await ensureDefaultEnabledModel(tx)

      return {
        error: null,
        model: created,
      }
    })

    return result.error
      ? result
      : {
          error: null,
          model: toStoredSummary(result.model),
        }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed')
    ) {
      return {
        error: 'duplicate_id' as const,
        model: null,
      }
    }

    throw error
  }
}

export async function updateStoredChatModelConfig(
  modelId: string,
  input: StoredChatModelConfigUpdateInput
) {
  const currentModel = await findStoredChatModelConfigById(modelId)

  if (!currentModel) {
    return {
      error: 'not_found' as const,
      model: null,
    }
  }

  const shouldUpdateApiKey =
    typeof input.apiKey === 'string' && input.apiKey.trim().length > 0
  const encryptedApiKey = shouldUpdateApiKey
    ? encryptApiKey(input.apiKey ?? '')
    : null

  if (encryptedApiKey?.error) {
    return {
      error: 'missing_secret' as const,
      model: null,
    }
  }

  const nextEnabled = input.enabled ?? currentModel.enabled
  const nextIsDefault = input.isDefault ?? currentModel.isDefault

  if (!nextEnabled && nextIsDefault) {
    return {
      error: 'disabled_default_model' as const,
      model: null,
    }
  }

  const result = await runStoredChatModelTransaction(async (tx) => {
    if (!nextEnabled) {
      const otherEnabledCount = await tx.chatModelConfig.count({
        where: {
          enabled: true,
          id: {
            not: modelId,
          },
        },
      })

      if (otherEnabledCount === 0) {
        return {
          error: 'last_enabled_model' as const,
          model: null,
        }
      }
    }

    if (nextIsDefault) {
      await clearDefaultStoredChatModels(tx, modelId)
    }

    const updated = await updateStoredChatModelRow(tx, modelId, {
      ...input,
      apiKeyCiphertext:
        shouldUpdateApiKey && encryptedApiKey
          ? encryptedApiKey.ciphertext
          : undefined,
    })

    await ensureDefaultEnabledModel(tx)

    return {
      error: null,
      model: updated,
    }
  })

  return result.error
    ? result
    : {
        error: null,
        model: toStoredSummary(result.model),
      }
}

export async function deleteStoredChatModelConfig(modelId: string) {
  const currentModel = await findStoredChatModelConfigMetaById(modelId)

  if (!currentModel) {
    return {
      error: 'not_found' as const,
    }
  }

  const result = await runStoredChatModelTransaction(async (tx) => {
    if (currentModel.enabled) {
      const otherEnabledCount = await tx.chatModelConfig.count({
        where: {
          enabled: true,
          id: {
            not: modelId,
          },
        },
      })

      if (otherEnabledCount === 0) {
        return {
          error: 'last_enabled_model' as const,
        }
      }
    }

    await deleteStoredChatModelRow(tx, modelId)
    await ensureDefaultEnabledModel(tx)

    return {
      error: null,
    }
  })

  return result
}
