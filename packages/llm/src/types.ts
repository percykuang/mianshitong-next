export type ModelProvider = 'deepseek' | 'ollama' | 'openai-compatible'

export interface ChatModelOption {
  id: string
  label: string
  description?: string
}

export interface ChatModelCatalogItem extends ChatModelOption {
  apiKey?: string
  baseUrl?: string
  enabled?: boolean
  isDefault?: boolean
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
  sortOrder?: number
  supportsJsonOutput?: boolean
}

export interface StoredChatModelConfigSummary extends ChatModelCatalogItem {
  apiKeyPreview: string
  createdAt: Date
  updatedAt: Date
}

export interface StoredChatModelConfigInput {
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
  provider: ModelProvider
  sortOrder: number
  supportsJsonOutput: boolean
}
