import type {
  AcceptedChatModelId,
  ChatModelCatalogItem,
  ChatModelAlias,
  ChatModelId,
  ChatModelOption,
  ModelRole,
} from './types'

const CHAT_MODEL_CATALOG = [
  {
    id: 'balanced',
    aliases: ['deepseek-chat'],
    label: '标准模式',
    description: '响应更均衡，适合日常问答和面试表达整理。',
    role: 'chat',
  },
  {
    id: 'reasoning',
    aliases: ['deepseek-reasoner'],
    label: '深度推理',
    description: '更适合复杂推理、追问拆解和深度分析。',
    role: 'reasoner',
  },
] as const satisfies readonly ChatModelCatalogItem[]

const DEFAULT_CHAT_MODEL_ID = CHAT_MODEL_CATALOG[0].id

const CHAT_MODEL_BY_ID = Object.fromEntries(
  CHAT_MODEL_CATALOG.map((model) => [model.id, model])
) as Record<ChatModelId, (typeof CHAT_MODEL_CATALOG)[number]>

const CHAT_MODEL_ID_BY_ALIAS = Object.fromEntries(
  CHAT_MODEL_CATALOG.flatMap((model) =>
    (model.aliases ?? []).map((alias) => [alias, model.id])
  )
) as Record<ChatModelAlias, ChatModelId>

// 返回服务端维护的完整聊天模型目录。
export function getChatModelCatalog() {
  return CHAT_MODEL_CATALOG
}

// 返回前端模型选择器需要的公开字段。
export function getChatModelOptions(): ChatModelOption[] {
  return CHAT_MODEL_CATALOG.map(({ id, label, description }) => ({
    id,
    label,
    description,
  }))
}

// 返回聊天场景默认选中的模型 id。
export function getDefaultChatModelId(): ChatModelId {
  return DEFAULT_CHAT_MODEL_ID
}

// 校验一个字符串是否为受支持的聊天模型 id。
export function isChatModelId(value: string): value is AcceptedChatModelId {
  return value in CHAT_MODEL_BY_ID || value in CHAT_MODEL_ID_BY_ALIAS
}

// 将外部传入的模型 id 规范成系统可识别的默认值。
export function normalizeChatModelId(
  value: string | null | undefined
): ChatModelId {
  if (!value) {
    return DEFAULT_CHAT_MODEL_ID
  }

  if (value in CHAT_MODEL_BY_ID) {
    return value as ChatModelId
  }

  return (
    CHAT_MODEL_ID_BY_ALIAS[value as ChatModelAlias] ?? DEFAULT_CHAT_MODEL_ID
  )
}

// 根据模型 id 获取它在底层 provider 中对应的角色。
export function getChatModelRole(modelId: string): ModelRole {
  return CHAT_MODEL_BY_ID[normalizeChatModelId(modelId)].role
}

// 根据角色获取该角色默认使用的模型 id。
export function getDefaultChatModelIdForRole(role: ModelRole): ChatModelId {
  const matchedModel = CHAT_MODEL_CATALOG.find((model) => model.role === role)

  return matchedModel?.id ?? DEFAULT_CHAT_MODEL_ID
}
