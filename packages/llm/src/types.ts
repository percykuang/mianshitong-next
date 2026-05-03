export type ModelProvider = 'deepseek' | 'ollama' | 'openai-compatible'

export interface ChatModelOption {
  id: string
  label: string
  description?: string
}

export interface StoredChatModelConfigSummary extends ChatModelOption {
  apiKeyPreview: string
  baseUrl: string
  createdAt: Date
  enabled: boolean
  isDefault: boolean
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
  sortOrder: number
  supportsJsonOutput: boolean
  updatedAt: Date
}

export interface StoredChatModelConfigInput extends ChatModelOption {
  apiKey: string
  baseUrl: string
  enabled: boolean
  isDefault: boolean
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
  sortOrder: number
  supportsJsonOutput: boolean
}
