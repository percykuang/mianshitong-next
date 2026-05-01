import type { ModelProvider } from '@mianshitong/llm'

export type AdminChatModelProvider = ModelProvider

export interface AdminChatModelUpsertPayload {
  apiKey: string
  baseUrl: string
  description: string
  enabled: boolean
  id: string
  isDefault: boolean
  jsonModelKwargsJson: string
  label: string
  model: string
  modelKwargsJson: string
  provider: AdminChatModelProvider
  sortOrder: number
  supportsJsonOutput: boolean
}
