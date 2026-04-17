function normalizeSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export function resolveAdminInternalPath(
  value: string | string[] | undefined,
  fallback: string
) {
  const normalizedValue = normalizeSingleValue(value)

  if (
    normalizedValue &&
    normalizedValue.startsWith('/') &&
    !normalizedValue.startsWith('//')
  ) {
    return normalizedValue
  }

  return fallback
}

export function resolveRedirect(value: string | string[] | undefined) {
  return resolveAdminInternalPath(value, '/users')
}
