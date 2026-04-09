export type MainModelProvider = 'deepseek' | 'ollama'
export type ChatModelId = 'deepseek-chat' | 'deepseek-reasoner'
export type ModelRole = 'chat' | 'reasoner'

export interface ChatModelOption {
  id: ChatModelId
  label: string
  description: string
}

export interface ChatModelCatalogItem extends ChatModelOption {
  role: ModelRole
}

export interface ChatModelRuntimeInfo {
  actualModel: string
  displayTarget: string
  mode: 'local' | 'remote'
  provider: MainModelProvider
  requestedModelId: ChatModelId
}
