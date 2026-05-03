import type { Runnable } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import { KeyedCache } from '@mianshitong/shared/runtime'
import { createHash } from 'node:crypto'
import 'server-only'

import type { ModelProvider } from '../types'
import type { ModelConnectionConfig } from './plan'

const modelClientCache = new KeyedCache<string, ChatOpenAI>()
const jsonModelClientCache = new KeyedCache<
  string,
  Runnable<
    Parameters<ChatOpenAI['invoke']>[0],
    Awaited<ReturnType<ChatOpenAI['invoke']>>
  >
>()

function buildModelClientCacheKey(input: {
  apiKey?: string
  baseURL: string
  model: string
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}) {
  return [
    input.provider,
    input.baseURL,
    createHash('sha256')
      .update(input.apiKey ?? '')
      .digest('hex'),
    input.model,
    JSON.stringify(input.modelKwargs ?? {}),
  ].join(':')
}

function createModelClient(
  connection: ModelConnectionConfig,
  modelKwargs = connection.modelKwargs
) {
  return new ChatOpenAI({
    model: connection.model,
    apiKey: connection.apiKey,
    modelKwargs,
    configuration: {
      baseURL: connection.baseURL,
    },
  })
}

export function getOrCreateModelClient(input: {
  connection: ModelConnectionConfig
  modelKwargs?: Record<string, unknown>
  provider: ModelProvider
}) {
  const cacheKey = buildModelClientCacheKey({
    provider: input.provider,
    baseURL: input.connection.baseURL,
    apiKey: input.connection.apiKey,
    model: input.connection.model,
    modelKwargs: input.modelKwargs ?? input.connection.modelKwargs,
  })

  return modelClientCache.getOrCreate(cacheKey, () =>
    createModelClient(input.connection, input.modelKwargs)
  )
}

export function getOrCreateJsonModelClient(input: {
  connection: ModelConnectionConfig
  provider: ModelProvider
}) {
  const cacheKey = `${buildModelClientCacheKey({
    provider: input.provider,
    baseURL: input.connection.baseURL,
    apiKey: input.connection.apiKey,
    model: input.connection.model,
    modelKwargs: input.connection.jsonModelKwargs,
  })}:json_object`

  return jsonModelClientCache.getOrCreate(cacheKey, () =>
    getOrCreateModelClient({
      connection: input.connection,
      modelKwargs: input.connection.jsonModelKwargs,
      provider: input.provider,
    }).withConfig({
      response_format: {
        type: 'json_object',
      },
    })
  )
}
