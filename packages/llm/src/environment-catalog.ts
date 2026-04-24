import { type AppEnv, getAppEnv } from './env'
import type { ChatModelCatalogItem } from './types'

const CHAT_MODEL_CATALOG_BY_ENV = {
  development: [
    {
      id: 'qwen3-1.7b',
      label: 'Qwen3:1.7b',
      model: 'qwen3:1.7b',
      provider: 'ollama',
      description: '响应更均衡，适合日常问答和面试表达整理。',
    },
    {
      id: 'deepseek-r1-8b',
      label: 'DeepSeek R1:8b',
      model: 'deepseek-r1:8b',
      provider: 'ollama',
      description: '更适合复杂推理、追问拆解和深度分析。',
    },
  ],
  production: [
    {
      id: 'deepseek-chat',
      label: 'DeepSeek Chat',
      model: 'deepseek-chat',
      provider: 'deepseek',
      description: '响应更均衡，适合日常问答和面试表达整理。',
    },
    {
      id: 'deepseek-reasoner',
      label: 'DeepSeek Reasoner',
      model: 'deepseek-reasoner',
      provider: 'deepseek',
      description: '更适合复杂推理、追问拆解和深度分析。',
    },
  ],
} as const satisfies Record<AppEnv, readonly ChatModelCatalogItem[]>

export function getChatModelCatalogForCurrentEnv(): ChatModelCatalogItem[] {
  return [...CHAT_MODEL_CATALOG_BY_ENV[getAppEnv()]]
}
