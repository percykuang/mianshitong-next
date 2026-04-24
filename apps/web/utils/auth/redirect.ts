import { buildPathWithSearchParams } from '@mianshitong/shared/runtime'

const AUTH_PAGE_PATHS = ['/login', '/register'] as const

export const DEFAULT_AUTH_REDIRECT = '/chat'

type AuthRedirectValue = string | string[] | null | undefined

function getFirstValue(value: AuthRedirectValue) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function isSafeInternalPath(path: string) {
  return path.startsWith('/') && !path.startsWith('//')
}

function isAuthPagePath(path: string) {
  return AUTH_PAGE_PATHS.some((authPagePath) => {
    return (
      path === authPagePath ||
      path.startsWith(`${authPagePath}?`) ||
      path.startsWith(`${authPagePath}#`)
    )
  })
}

export function resolveAuthRedirect(value: AuthRedirectValue) {
  const redirectTarget = getFirstValue(value)

  if (
    !redirectTarget ||
    !isSafeInternalPath(redirectTarget) ||
    isAuthPagePath(redirectTarget)
  ) {
    return DEFAULT_AUTH_REDIRECT
  }

  return redirectTarget
}

export function createAuthPageHref(
  authPath: '/login' | '/register',
  redirectTarget: string | null | undefined
) {
  if (
    !redirectTarget ||
    !isSafeInternalPath(redirectTarget) ||
    isAuthPagePath(redirectTarget)
  ) {
    return authPath
  }

  return buildPathWithSearchParams(authPath, {
    redirect: redirectTarget,
  })
}
