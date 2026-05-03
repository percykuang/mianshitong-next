interface SafeParseIssue {
  message?: string
}

interface SafeParseFailure {
  error: {
    issues: SafeParseIssue[]
  }
  success: false
}

interface SafeParseSuccess<TOutput> {
  data: TOutput
  success: true
}

export interface SafeParseSchema<TInput, TOutput> {
  safeParse(input: TInput): SafeParseFailure | SafeParseSuccess<TOutput>
}

export type SafeParseDataResult<TOutput> =
  | {
      data: TOutput
      errorMessage: null
    }
  | {
      data: null
      errorMessage: string
    }

/**
 * 将 schema 的 `safeParse` 结果收敛成统一的数据结构。
 * 成功时返回解析后的 `data`，失败时返回首条 issue message，
 * 并在 issue 缺失时回退到调用方提供的默认错误文案。
 */
export function safeParseWithIssueMessage<TInput, TOutput>(
  schema: SafeParseSchema<TInput, TOutput>,
  input: TInput,
  fallbackMessage = '请求参数不合法'
): SafeParseDataResult<TOutput> {
  const result = schema.safeParse(input)

  if (!result.success) {
    return {
      data: null,
      errorMessage: result.error.issues[0]?.message ?? fallbackMessage,
    }
  }

  return {
    data: result.data,
    errorMessage: null,
  }
}
