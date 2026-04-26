export type ModelProvider = 'deepseek' | 'ollama'
export type ChatModelId = string
export type AcceptedChatModelId = ChatModelId

export interface ChatModelOption {
  id: ChatModelId
  label: string
  description?: string
}

export interface ChatModelCatalogItem extends ChatModelOption {
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}
