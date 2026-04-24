export type SearchParamValue = boolean | number | string | null | undefined

export type SearchParamsInput = Record<string, SearchParamValue>

/**
 * 基于对象创建查询参数字符串。
 * 会自动忽略 `null` 和 `undefined`，其余值统一转成字符串写入 `URLSearchParams`。
 */
export function createSearchParams(input: SearchParamsInput) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams
}

/**
 * 将路径和查询参数对象拼成最终 href。
 * 当查询参数为空时直接返回原始路径，避免额外拼接 `?`。
 */
export function buildPathWithSearchParams(
  path: string,
  input: SearchParamsInput
) {
  const searchParams = createSearchParams(input)
  const queryString = searchParams.toString()

  return queryString ? `${path}?${queryString}` : path
}
