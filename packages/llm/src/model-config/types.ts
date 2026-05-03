import type { StoredChatModelConfigInput } from '../types'

export interface RuntimeChatModelConfig {
  apiKey: string
  baseUrl: string
  description?: string
  enabled: boolean
  id: string
  isDefault: boolean
  jsonModelKwargs?: Record<string, unknown>
  label: string
  model: string
  modelKwargs?: Record<string, unknown>
  provider: StoredChatModelConfigInput['provider']
  sortOrder: number
  supportsJsonOutput: boolean
}

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
