import { type StoredChatModelConfigInput } from '@mianshitong/llm'
import { safeJsonParse } from '@mianshitong/shared/runtime'

import type { AdminChatModelUpsertPayload } from '@/shared/model-dto'

import type {
  ParsedAdminChatModelBasePayload,
  ParsedAdminChatModelPayload,
} from './types'

const MAX_SORT_ORDER = 10_000

type ParseResult<T> =
  | {
      data: T
      error: null
    }
  | {
      data: null
      error: string
    }

type AdminChatModelPayloadInput = Partial<AdminChatModelUpsertPayload> &
  Record<string, unknown>

function normalizeTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

function normalizeInteger(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : null
}

function parseModelProvider(
  value: unknown
): StoredChatModelConfigInput['provider'] | null {
  return value === 'deepseek' ||
    value === 'ollama' ||
    value === 'openai-compatible'
    ? value
    : null
}

function parseOptionalJsonObjectText(
  value: unknown,
  fieldLabel: string,
  options?: {
    emptyAsNull?: boolean
  }
): ParseResult<Record<string, unknown> | null | undefined> {
  const text = normalizeTrimmedString(value)

  if (!text) {
    return {
      data: options?.emptyAsNull ? null : undefined,
      error: null,
    }
  }

  const parsed = safeJsonParse(text)

  if (
    parsed.error ||
    !parsed.data ||
    typeof parsed.data !== 'object' ||
    Array.isArray(parsed.data)
  ) {
    return {
      data: null,
      error: `${fieldLabel} 必须是合法的 JSON 对象`,
    }
  }

  return {
    data: parsed.data as Record<string, unknown>,
    error: null,
  }
}

function validateCommonPayloadFields(
  input: AdminChatModelPayloadInput
): ParseResult<ParsedAdminChatModelBasePayload> {
  const id = normalizeTrimmedString(input.id)
  const label = normalizeTrimmedString(input.label)
  const descriptionText = normalizeTrimmedString(input.description)
  const provider = parseModelProvider(input.provider)
  const baseUrl = normalizeTrimmedString(input.baseUrl)
  const model = normalizeTrimmedString(input.model)
  const enabled = normalizeBoolean(input.enabled)
  const isDefault = normalizeBoolean(input.isDefault)
  const supportsJsonOutput = normalizeBoolean(input.supportsJsonOutput)
  const sortOrder = normalizeInteger(input.sortOrder)

  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(id)) {
    return {
      data: null,
      error: '模型 ID 只能包含小写字母、数字和连字符，且不能以连字符开头或结尾',
    }
  }

  if (!label) {
    return {
      data: null,
      error: '显示名称不能为空',
    }
  }

  if (!provider) {
    return {
      data: null,
      error: '模型提供方不合法',
    }
  }

  try {
    const parsedBaseUrl = new URL(baseUrl)

    if (!parsedBaseUrl.protocol.startsWith('http')) {
      return {
        data: null,
        error: 'Base URL 必须是 http 或 https 地址',
      }
    }
  } catch {
    return {
      data: null,
      error: 'Base URL 格式不合法',
    }
  }

  if (!model) {
    return {
      data: null,
      error: '模型名称不能为空',
    }
  }

  if (enabled === null || isDefault === null || supportsJsonOutput === null) {
    return {
      data: null,
      error: '布尔字段不合法',
    }
  }

  if (sortOrder === null || sortOrder < 0 || sortOrder > MAX_SORT_ORDER) {
    return {
      data: null,
      error: `排序值必须是 0 到 ${MAX_SORT_ORDER} 之间的整数`,
    }
  }

  if (!enabled && isDefault) {
    return {
      data: null,
      error: '默认模型必须保持启用状态',
    }
  }

  return {
    data: {
      id,
      label,
      description: descriptionText || undefined,
      provider,
      baseUrl,
      model,
      enabled,
      isDefault,
      supportsJsonOutput,
      sortOrder,
    },
    error: null,
  }
}

export function parseCreateAdminChatModelPayload(
  payload: unknown
): ParseResult<ParsedAdminChatModelPayload> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      data: null,
      error: '请求体必须是对象',
    }
  }

  const input = payload as AdminChatModelPayloadInput
  const common = validateCommonPayloadFields(input)

  if (common.error) {
    return common
  }

  const commonData = common.data

  if (!commonData) {
    return {
      data: null,
      error: '模型配置解析失败',
    }
  }

  const apiKey = normalizeTrimmedString(input.apiKey)

  if (!apiKey) {
    return {
      data: null,
      error: 'API Key 不能为空',
    }
  }

  const modelKwargs = parseOptionalJsonObjectText(
    input.modelKwargsJson,
    '模型参数 JSON'
  )

  if (modelKwargs.error) {
    return modelKwargs
  }

  const jsonModelKwargs = parseOptionalJsonObjectText(
    input.jsonModelKwargsJson,
    '结构化输出参数 JSON'
  )

  if (jsonModelKwargs.error) {
    return jsonModelKwargs
  }

  return {
    data: {
      ...commonData,
      apiKey,
      modelKwargs: modelKwargs.data,
      jsonModelKwargs: jsonModelKwargs.data,
    },
    error: null,
  }
}

export function parseUpdateAdminChatModelPayload(
  modelId: string,
  payload: unknown
): ParseResult<ParsedAdminChatModelPayload> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      data: null,
      error: '请求体必须是对象',
    }
  }

  const input = payload as AdminChatModelPayloadInput
  const common = validateCommonPayloadFields({
    ...input,
    id: modelId,
  })

  if (common.error) {
    return common
  }

  const commonData = common.data

  if (!commonData) {
    return {
      data: null,
      error: '模型配置解析失败',
    }
  }

  const descriptionText = normalizeTrimmedString(input.description)
  const modelKwargs = parseOptionalJsonObjectText(
    input.modelKwargsJson,
    '模型参数 JSON',
    {
      emptyAsNull: true,
    }
  )

  if (modelKwargs.error) {
    return modelKwargs
  }

  const jsonModelKwargs = parseOptionalJsonObjectText(
    input.jsonModelKwargsJson,
    '结构化输出参数 JSON',
    {
      emptyAsNull: true,
    }
  )

  if (jsonModelKwargs.error) {
    return jsonModelKwargs
  }

  return {
    data: {
      ...commonData,
      description: descriptionText || null,
      apiKey: normalizeTrimmedString(input.apiKey) || undefined,
      modelKwargs: modelKwargs.data,
      jsonModelKwargs: jsonModelKwargs.data,
    },
    error: null,
  }
}
