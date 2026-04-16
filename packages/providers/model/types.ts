export type MainModelProvider = 'deepseek' | 'ollama'
export type ChatModelId = 'balanced' | 'reasoning'
export type ChatModelAlias = 'deepseek-chat' | 'deepseek-reasoner'
export type AcceptedChatModelId = ChatModelId | ChatModelAlias
export type ModelRole = 'chat' | 'reasoner'

export interface ChatModelOption {
  id: ChatModelId
  label: string
  description: string
}

export interface ChatModelCatalogItem extends ChatModelOption {
  aliases?: readonly ChatModelAlias[]
  role: ModelRole
}

export interface ChatModelRuntimeInfo {
  actualModel: string
  displayTarget: string
  mode: 'local' | 'remote'
  provider: MainModelProvider
  requestedModelId: ChatModelId
}
