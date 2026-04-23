import { getCareerRouterModel } from '@mianshitong/providers'
import { withTaskRetry } from '@mianshitong/shared/utils'
import type { ZodTypeAny } from 'zod'

function normalizeContent(
  content:
    | string
    | Array<string | { text?: string; type?: string }>
    | null
    | undefined
) {
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

function extractJsonObject(text: string) {
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

export async function invokeCareerStructuredModel<T extends ZodTypeAny>(input: {
  jsonFallbackPrompt: string
  label: string
  schema: T
  systemPrompt: string
  userPayload: unknown
}) {
  try {
    const result = await withTaskRetry(
      () =>
        getCareerRouterModel()
          .withStructuredOutput(input.schema, {
            method: 'functionCalling',
            includeRaw: false,
          })
          .invoke([
            {
              role: 'system',
              content: input.systemPrompt,
            },
            {
              role: 'user',
              content: JSON.stringify(input.userPayload, null, 2),
            },
          ]),
      {
        maxRetries: 1,
      }
    )

    return input.schema.parse(result)
  } catch {
    // Fall back to plain JSON prompting when structured output is unavailable.
  }

  const rawResult = await withTaskRetry(
    () =>
      getCareerRouterModel().invoke([
        {
          role: 'system',
          content: [input.systemPrompt, input.jsonFallbackPrompt].join('\n\n'),
        },
        {
          role: 'user',
          content: JSON.stringify(input.userPayload, null, 2),
        },
      ]),
    {
      maxRetries: 1,
    }
  )
  const jsonText = extractJsonObject(normalizeContent(rawResult.content))

  if (!jsonText) {
    throw new Error(`${input.label} JSON fallback returned no JSON object.`)
  }

  return input.schema.parse(JSON.parse(jsonText))
}
