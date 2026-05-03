export type ModelTextPart =
  | string
  | {
      text?: string
      type?: string
    }

export type ModelTextContent = ModelTextPart[] | string | null | undefined

export interface ModelStreamChunkLike {
  content?: ModelTextContent
  text?: string
}

/**
 * 将模型返回的文本内容归一化为普通字符串。
 * 兼容 string、分片数组以及空值场景，便于业务层统一处理模型输出。
 */
export function normalizeModelTextContent(content: ModelTextContent) {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      return typeof part?.text === 'string' ? part.text : ''
    })
    .join('')
}

/**
 * 从模型流式 chunk 中提取当前可消费的文本。
 * 优先读取 `content`，若不存在再回退到 `text` 字段。
 */
export function normalizeModelChunkText(
  chunk: ModelStreamChunkLike | null | undefined
) {
  const normalizedContent = normalizeModelTextContent(chunk?.content)

  if (normalizedContent) {
    return normalizedContent
  }

  return typeof chunk?.text === 'string' ? chunk.text : ''
}

/**
 * 从模型返回的文本中提取一个 JSON 对象字符串。
 * 会优先处理 fenced code block，再回退到整段文本中最外层的 `{...}`。
 */
export function extractJsonObjectFromModelText(text: string) {
  const trimmed = text.trim()

  if (!trimmed) {
    return null
  }

  const fencedMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed)
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed
  const startIndex = candidate.indexOf('{')
  const endIndex = candidate.lastIndexOf('}')

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null
  }

  return candidate.slice(startIndex, endIndex + 1)
}
