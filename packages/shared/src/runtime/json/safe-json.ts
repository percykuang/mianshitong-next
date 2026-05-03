export type SafeJsonParseResult<T = unknown> =
  | {
      data: T
      error: null
    }
  | {
      data: null
      error: Error
    }

export type SafeJsonStringifyResult =
  | {
      data: string
      error: null
    }
  | {
      data: null
      error: Error
    }

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error))
}

export function safeJsonParse<T = unknown>(
  text: string
): SafeJsonParseResult<T> {
  try {
    return {
      data: JSON.parse(text) as T,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: toError(error),
    }
  }
}

export function safeJsonStringify(
  value: unknown,
  space?: string | number
): SafeJsonStringifyResult {
  try {
    const data = JSON.stringify(value, null, space)

    if (typeof data !== 'string') {
      return {
        data: null,
        error: new Error('Value is not JSON serializable.'),
      }
    }

    return {
      data,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: toError(error),
    }
  }
}
