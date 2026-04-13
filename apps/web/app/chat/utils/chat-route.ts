const CHAT_ROOT_PATH = '/chat'
const CHAT_SESSION_PATH_PREFIX = `${CHAT_ROOT_PATH}/`

export function normalizeRouteSessionId(sessionId?: string | null) {
  if (typeof sessionId !== 'string') {
    return null
  }

  let decodedSessionId = sessionId

  try {
    decodedSessionId = decodeURIComponent(sessionId)
  } catch {
    return null
  }

  const normalized = decodedSessionId.trim()

  if (!normalized || normalized.includes('/')) {
    return null
  }

  return normalized
}

export function buildChatPath(sessionId?: string | null) {
  const normalized = normalizeRouteSessionId(sessionId)

  return normalized
    ? `${CHAT_SESSION_PATH_PREFIX}${encodeURIComponent(normalized)}`
    : CHAT_ROOT_PATH
}

export function getRouteSessionIdFromPathname(pathname?: string | null) {
  if (!pathname) {
    return null
  }

  const normalizedPathname = pathname.split(/[?#]/, 1)[0] ?? pathname

  if (normalizedPathname === CHAT_ROOT_PATH) {
    return null
  }

  if (!normalizedPathname.startsWith(CHAT_SESSION_PATH_PREFIX)) {
    return null
  }

  return normalizeRouteSessionId(
    normalizedPathname.slice(CHAT_SESSION_PATH_PREFIX.length)
  )
}
