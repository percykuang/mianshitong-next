export type ModelProvider = 'deepseek' | 'ollama'
export type ChatModelId = string
export type AcceptedChatModelId = ChatModelId

export interface ChatModelOption {
  id: ChatModelId
  label: string
  description?: string
}

export interface ChatModelCatalogItem extends ChatModelOption {
  model: string
  provider: ModelProvider
}
