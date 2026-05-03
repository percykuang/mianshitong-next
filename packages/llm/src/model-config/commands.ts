import { db } from '@mianshitong/db'
import 'server-only'

import type { StoredChatModelConfigInput } from '../types'
import { encryptApiKey } from './crypto'
import { toDbCreateInput, toDbUpdateInput, toStoredSummary } from './mapper'
import type { StoredChatModelConfigUpdateInput } from './types'

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
    const result = await db.transaction(async (tx) => {
      const modelCount = await tx.chatModelConfig.count()
      const enabledCount = await tx.chatModelConfig.countEnabled()

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
        (input.enabled && !(await tx.chatModelConfig.hasEnabledDefault()))

      if (shouldSetDefault) {
        await tx.chatModelConfig.clearDefault()
      }

      const created = await tx.chatModelConfig.create(
        toDbCreateInput({
          model: input,
          apiKeyCiphertext: encryptedApiKey.ciphertext,
          isDefault: shouldSetDefault,
        })
      )

      await tx.chatModelConfig.ensureDefaultEnabled()

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
  const currentModel = await db.chatModelConfig.findById(modelId)

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

  const result = await db.transaction(async (tx) => {
    if (!nextEnabled) {
      const otherEnabledCount =
        await tx.chatModelConfig.countOtherEnabled(modelId)

      if (otherEnabledCount === 0) {
        return {
          error: 'last_enabled_model' as const,
          model: null,
        }
      }
    }

    if (nextIsDefault) {
      await tx.chatModelConfig.clearDefault(modelId)
    }

    const updated = await tx.chatModelConfig.update(
      modelId,
      toDbUpdateInput({
        model: input,
        apiKeyCiphertext:
          shouldUpdateApiKey && encryptedApiKey
            ? encryptedApiKey.ciphertext
            : undefined,
      })
    )

    await tx.chatModelConfig.ensureDefaultEnabled()

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
  const currentModel = await db.chatModelConfig.findMetaById(modelId)

  if (!currentModel) {
    return {
      error: 'not_found' as const,
    }
  }

  const result = await db.transaction(async (tx) => {
    if (currentModel.enabled) {
      const otherEnabledCount =
        await tx.chatModelConfig.countOtherEnabled(modelId)

      if (otherEnabledCount === 0) {
        return {
          error: 'last_enabled_model' as const,
        }
      }
    }

    await tx.chatModelConfig.delete(modelId)
    await tx.chatModelConfig.ensureDefaultEnabled()

    return {
      error: null,
    }
  })

  return result
}
