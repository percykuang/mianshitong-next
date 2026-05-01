import {
  extractJsonObjectFromModelText,
  getJsonChatModel,
  normalizeModelTextContent,
} from '@mianshitong/llm'
import {
  safeJsonParse,
  safeJsonStringify,
  withTaskRetry,
} from '@mianshitong/shared/runtime'
import type { ZodTypeAny } from 'zod'

interface InvokedModelMessage {
  content?:
    | string
    | Array<string | { text?: string; type?: string }>
    | null
    | undefined
}

export async function invokeCareerStructuredModel<T extends ZodTypeAny>(input: {
  jsonFallbackPrompt: string
  label: string
  modelId: string
  schema: T
  systemPrompt: string
  userPayload: unknown
}) {
  const model = await getJsonChatModel(input.modelId)
  const userPayloadJson = safeJsonStringify(input.userPayload, 2)

  if (userPayloadJson.error) {
    throw new Error(`${input.label} payload is not JSON serializable.`, {
      cause: userPayloadJson.error,
    })
  }

  const rawResult = (await withTaskRetry(
    () =>
      model.invoke([
        {
          role: 'system',
          content: [input.systemPrompt, input.jsonFallbackPrompt].join('\n\n'),
        },
        {
          role: 'user',
          content: userPayloadJson.data,
        },
      ]),
    {
      maxRetries: 1,
    }
  )) as InvokedModelMessage
  const jsonText = extractJsonObjectFromModelText(
    normalizeModelTextContent(rawResult.content)
  )

  if (!jsonText) {
    throw new Error(`${input.label} JSON fallback returned no JSON object.`)
  }

  const parsedJson = safeJsonParse(jsonText)

  if (parsedJson.error) {
    throw new Error(`${input.label} JSON fallback returned invalid JSON.`, {
      cause: parsedJson.error,
    })
  }

  return input.schema.parse(parsedJson.data)
}
