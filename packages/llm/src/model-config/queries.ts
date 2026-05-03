import { db } from '@mianshitong/db'
import 'server-only'

import type { ChatModelOption, StoredChatModelConfigSummary } from '../types'
import {
  toChatModelOption,
  toRuntimeChatModelConfig,
  toStoredSummary,
} from './mapper'
import type { RuntimeChatModelConfig } from './types'

function getDefaultRuntimeChatModel(
  catalog: RuntimeChatModelConfig[]
): RuntimeChatModelConfig | null {
  return catalog.find((item) => item.isDefault) ?? catalog[0] ?? null
}

function normalizeRuntimeChatModelIdFromCatalog(
  catalog: RuntimeChatModelConfig[],
  value: string | null | undefined
) {
  return (
    catalog.find((item) => item.id === value)?.id ??
    getDefaultRuntimeChatModel(catalog)?.id ??
    ''
  )
}

export async function listStoredChatModelConfigSummaries(): Promise<
  StoredChatModelConfigSummary[]
> {
  const rows = await db.chatModelConfig.list()
  return rows.map(toStoredSummary)
}

export async function getRuntimeChatModelCatalog(): Promise<
  RuntimeChatModelConfig[]
> {
  const rows = await db.chatModelConfig.listEnabled()

  return rows
    .map(toRuntimeChatModelConfig)
    .filter(
      (
        config: RuntimeChatModelConfig | null
      ): config is RuntimeChatModelConfig => config !== null
    )
}

export async function getRuntimeChatModelOptions(): Promise<ChatModelOption[]> {
  return (await getRuntimeChatModelCatalog()).map(toChatModelOption)
}

export async function getRuntimeDefaultChatModelId(): Promise<string> {
  return (
    getDefaultRuntimeChatModel(await getRuntimeChatModelCatalog())?.id ?? ''
  )
}

export async function normalizeRuntimeChatModelId(
  value: string | null | undefined
): Promise<string> {
  return normalizeRuntimeChatModelIdFromCatalog(
    await getRuntimeChatModelCatalog(),
    value
  )
}

export async function getRuntimeChatModelCatalogItem(
  modelId: string | null | undefined
): Promise<RuntimeChatModelConfig | null> {
  const catalog = await getRuntimeChatModelCatalog()
  const normalizedModelId = normalizeRuntimeChatModelIdFromCatalog(
    catalog,
    modelId
  )

  return (
    catalog.find((item) => item.id === normalizedModelId) ??
    getDefaultRuntimeChatModel(catalog)
  )
}
