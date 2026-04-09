import type {
  ChatModelRuntimeInfo,
  MainModelProvider,
  ModelRole,
} from './types'
import { normalizeOpenAICompatibleBaseUrl } from './utils'

interface ProviderConfig {
  apiKeyEnv: string
  baseUrlEnv: string
  defaultApiKey?: string
  defaultBaseUrl: string
  displayTarget: string
  mode: ChatModelRuntimeInfo['mode']
  normalizeBaseUrl?: (baseUrl: string) => string
}

interface RoleConfig {
  defaultModel: string
  fallbackMaxTokensEnv?: string
  fallbackModelEnv?: string
  fallbackTemperatureEnv?: string
  maxTokensEnv: string
  modelEnv: string
  temperatureEnv: string
}

export const DEFAULT_TEMPERATURE = 0
export const DEFAULT_MAX_TOKENS = 8192

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434'
const DEFAULT_OLLAMA_API_KEY = 'ollama'
const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

export const PROVIDER_CONFIG_BY_NAME: Record<
  MainModelProvider,
  ProviderConfig
> = {
  deepseek: {
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    baseUrlEnv: 'DEEPSEEK_BASE_URL',
    defaultBaseUrl: DEFAULT_DEEPSEEK_BASE_URL,
    displayTarget: 'DeepSeek API',
    mode: 'remote',
  },
  ollama: {
    apiKeyEnv: 'OLLAMA_API_KEY',
    baseUrlEnv: 'OLLAMA_BASE_URL',
    defaultApiKey: DEFAULT_OLLAMA_API_KEY,
    defaultBaseUrl: DEFAULT_OLLAMA_BASE_URL,
    displayTarget: 'Ollama Local',
    mode: 'local',
    normalizeBaseUrl: normalizeOpenAICompatibleBaseUrl,
  },
}

export const PROVIDER_ROLE_CONFIG_BY_NAME: Record<
  MainModelProvider,
  Record<ModelRole, RoleConfig>
> = {
  deepseek: {
    chat: {
      defaultModel: 'deepseek-chat',
      maxTokensEnv: 'DEEPSEEK_MAX_TOKENS',
      modelEnv: 'DEEPSEEK_MODEL',
      temperatureEnv: 'DEEPSEEK_TEMPERATURE',
    },
    reasoner: {
      defaultModel: 'deepseek-chat',
      fallbackMaxTokensEnv: 'DEEPSEEK_MAX_TOKENS',
      fallbackModelEnv: 'DEEPSEEK_MODEL',
      fallbackTemperatureEnv: 'DEEPSEEK_TEMPERATURE',
      maxTokensEnv: 'DEEPSEEK_REASONER_MAX_TOKENS',
      modelEnv: 'DEEPSEEK_REASONER_MODEL',
      temperatureEnv: 'DEEPSEEK_REASONER_TEMPERATURE',
    },
  },
  ollama: {
    chat: {
      defaultModel: 'llama3.1',
      maxTokensEnv: 'OLLAMA_MAX_TOKENS',
      modelEnv: 'OLLAMA_MODEL',
      temperatureEnv: 'OLLAMA_TEMPERATURE',
    },
    reasoner: {
      defaultModel: 'llama3.1',
      fallbackMaxTokensEnv: 'OLLAMA_MAX_TOKENS',
      fallbackModelEnv: 'OLLAMA_MODEL',
      fallbackTemperatureEnv: 'OLLAMA_TEMPERATURE',
      maxTokensEnv: 'OLLAMA_REASONER_MAX_TOKENS',
      modelEnv: 'OLLAMA_REASONER_MODEL',
      temperatureEnv: 'OLLAMA_REASONER_TEMPERATURE',
    },
  },
}
