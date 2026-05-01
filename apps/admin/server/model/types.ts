import type { ModelProvider } from '@mianshitong/llm'

import type { AdminChatModelUpsertPayload } from '@/shared/model-dto'

export interface ParsedAdminChatModelBasePayload {
  baseUrl: AdminChatModelUpsertPayload['baseUrl']
  description?: string
  enabled: AdminChatModelUpsertPayload['enabled']
  id: AdminChatModelUpsertPayload['id']
  isDefault: AdminChatModelUpsertPayload['isDefault']
  label: AdminChatModelUpsertPayload['label']
  model: AdminChatModelUpsertPayload['model']
  provider: AdminChatModelUpsertPayload['provider']
  sortOrder: AdminChatModelUpsertPayload['sortOrder']
  supportsJsonOutput: AdminChatModelUpsertPayload['supportsJsonOutput']
}

export interface ParsedAdminChatModelPayload extends Omit<
  ParsedAdminChatModelBasePayload,
  'description'
> {
  apiKey?: string
  description?: string | null
  jsonModelKwargs?: Record<string, unknown> | null
  modelKwargs?: Record<string, unknown> | null
}

export interface AdminChatModelListItem {
  apiKeyPreview: string
  baseUrl: string
  description: string
  enabled: boolean
  id: string
  isDefault: boolean
  jsonModelKwargsJson: string
  label: string
  model: string
  modelKwargsJson: string
  provider: ModelProvider
  sortOrder: number
  supportsJsonOutput: boolean
  updatedAtLabel: string
}

export interface AdminChatModelListResult {
  items: AdminChatModelListItem[]
}
