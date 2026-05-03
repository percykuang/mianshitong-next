export function normalizeOpenAICompatibleBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  return normalizedBaseUrl.endsWith('/v1')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/v1`
}
