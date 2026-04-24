import { getChatModelCatalogForCurrentEnv } from './environment-catalog'
import type {
  AcceptedChatModelId,
  ChatModelCatalogItem,
  ChatModelId,
  ChatModelOption,
} from './types'

function findChatModelById(
  modelCatalog: readonly ChatModelCatalogItem[],
  modelId: string
) {
  return modelCatalog.find((model) => model.id === modelId)
}

export function getChatModelOptions(): ChatModelOption[] {
  return getChatModelCatalogForCurrentEnv().map(
    ({ id, label, description }) => ({
      id,
      label,
      description,
    })
  )
}

export function getDefaultChatModelId(): ChatModelId {
  return getChatModelCatalogForCurrentEnv()[0]?.id ?? ''
}

export function isChatModelId(value: string): value is AcceptedChatModelId {
  return !!findChatModelById(getChatModelCatalogForCurrentEnv(), value)
}

export function normalizeChatModelId(
  value: string | null | undefined
): ChatModelId {
  if (!value) {
    return getDefaultChatModelId()
  }

  const matchedModel = findChatModelById(
    getChatModelCatalogForCurrentEnv(),
    value
  )

  return matchedModel?.id ?? getDefaultChatModelId()
}

export function getChatModelCatalogItem(
  modelId: string | null | undefined
): ChatModelCatalogItem {
  const chatModelId = normalizeChatModelId(modelId)
  const modelCatalog = getChatModelCatalogForCurrentEnv()

  return (
    findChatModelById(modelCatalog, chatModelId) ??
    modelCatalog[0] ?? {
      id: '',
      label: '',
      model: '',
      provider: 'ollama',
    }
  )
}
