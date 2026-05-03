import type { DbChatModelConfigProvider } from '@mianshitong/db'

import { normalizeOpenAICompatibleBaseUrl } from '../shared/openai-compatible'
import type { ModelProvider } from '../types'

interface ProviderConfig {
  defaultSupportsJsonOutput: boolean
  normalizeBaseUrl?: (baseUrl: string) => string
}

const PROVIDER_CONFIG_BY_NAME: Record<ModelProvider, ProviderConfig> = {
  deepseek: {
    defaultSupportsJsonOutput: true,
  },
  ollama: {
    defaultSupportsJsonOutput: false,
    normalizeBaseUrl: normalizeOpenAICompatibleBaseUrl,
  },
  'openai-compatible': {
    defaultSupportsJsonOutput: false,
  },
}

export function getProviderConfig(provider: ModelProvider) {
  return PROVIDER_CONFIG_BY_NAME[provider]
}

export function getDefaultSupportsJsonOutput(provider: ModelProvider) {
  return getProviderConfig(provider).defaultSupportsJsonOutput
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

export function toDbProvider(
  provider: ModelProvider
): DbChatModelConfigProvider {
  if (provider === 'openai-compatible') {
    return 'openaiCompatible'
  }

  return provider
}

export function fromDbProvider(
  provider: DbChatModelConfigProvider
): ModelProvider {
  if (provider === 'openaiCompatible') {
    return 'openai-compatible'
  }

  return provider
}
