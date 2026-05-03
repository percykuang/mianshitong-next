export type DbChatModelConfigProvider =
  | 'deepseek'
  | 'ollama'
  | 'openaiCompatible'

export interface DbChatModelConfigCreateInput {
  apiKeyCiphertext: string
  apiKeyPreview: string
  baseUrl: string
  description?: string | null
  enabled: boolean
  id: string
  isDefault: boolean
  jsonModelKwargs?: Record<string, unknown> | null
  label: string
  model: string
  modelKwargs?: Record<string, unknown> | null
  provider: DbChatModelConfigProvider
  sortOrder: number
  supportsJsonOutput: boolean
}

export interface DbChatModelConfigUpdateInput {
  apiKeyCiphertext?: string
  apiKeyPreview?: string
  baseUrl?: string
  description?: string | null
  enabled?: boolean
  isDefault?: boolean
  jsonModelKwargs?: Record<string, unknown> | null
  label?: string
  model?: string
  modelKwargs?: Record<string, unknown> | null
  provider?: DbChatModelConfigProvider
  sortOrder?: number
  supportsJsonOutput?: boolean
}

export interface DbStoredChatModelConfigRow {
  apiKeyCiphertext: string
  apiKeyPreview: string
  baseUrl: string
  createdAt: Date
  description: null | string
  enabled: boolean
  id: string
  isDefault: boolean
  jsonModelKwargs: unknown
  label: string
  model: string
  modelKwargs: unknown
  provider: DbChatModelConfigProvider
  sortOrder: number
  supportsJsonOutput: boolean
  updatedAt: Date
}

export type DbStoredEnabledChatModelConfigRow = DbStoredChatModelConfigRow

export interface DbChatModelConfigMetaValue {
  enabled: boolean
  id: string
  isDefault: boolean
}

export type DbChatModelConfigMetaRow = DbChatModelConfigMetaValue | null
