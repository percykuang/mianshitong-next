import { normalizeOpenAICompatibleBaseUrl } from '../env'
import type { ChatModelCatalogItem, ModelProvider } from '../types'

interface ProviderConfig {
  normalizeBaseUrl?: (baseUrl: string) => string
  supportsJsonOutput: boolean
}

export interface StoredRuntimeChatModelConfig extends ChatModelCatalogItem {
  apiKey: string
  baseUrl: string
  enabled: boolean
  isDefault: boolean
  sortOrder: number
  supportsJsonOutput: boolean
}

type PrismaChatModelProvider = 'deepseek' | 'ollama' | 'openaiCompatible'

const PROVIDER_CONFIG_BY_NAME: Record<ModelProvider, ProviderConfig> = {
  deepseek: {
    supportsJsonOutput: true,
  },
  ollama: {
    normalizeBaseUrl: normalizeOpenAICompatibleBaseUrl,
    supportsJsonOutput: false,
  },
  'openai-compatible': {
    supportsJsonOutput: false,
  },
}

export function getProviderConfig(provider: ModelProvider) {
  return PROVIDER_CONFIG_BY_NAME[provider]
}

export function toDbProvider(provider: ModelProvider): PrismaChatModelProvider {
  if (provider === 'openai-compatible') {
    return 'openaiCompatible'
  }

  return provider
}

export function fromDbProvider(
  provider: PrismaChatModelProvider
): ModelProvider {
  if (provider === 'openaiCompatible') {
    return 'openai-compatible'
  }

  return provider
}

export function resolveConfiguredBaseUrl(input: {
  baseUrl: string
  provider: ModelProvider
}) {
  const providerConfig = getProviderConfig(input.provider)

  return providerConfig.normalizeBaseUrl
    ? providerConfig.normalizeBaseUrl(input.baseUrl)
    : input.baseUrl
}
