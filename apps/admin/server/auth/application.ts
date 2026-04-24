import 'server-only'

import { verifyPassword } from './password'
import { deleteCurrentSession, getCurrentUser } from './session'
import { scheduleExpiredAdminSessionCleanup } from './session-cleanup'
import { createAuthSession, findUserByEmail } from './user-repository'
import { validateCredentials } from './validation'

export interface AuthUserSummary {
  email: string
  id: string
}

export interface AuthSessionCookiePayload {
  maxAgeSeconds: number
  sessionToken: string
}

type AuthMutationResult =
  | {
      error: null
      ok: true
      session: AuthSessionCookiePayload
      status: 200
      user: AuthUserSummary
    }
  | {
      error: string
      ok: false
      session?: never
      status: 400 | 401
      user?: never
    }

function toAuthUserSummary(user: {
  email: string
  id: string
}): AuthUserSummary {
  return {
    id: user.id,
    email: user.email,
  }
}

export async function getCurrentAuthUserProfile() {
  scheduleExpiredAdminSessionCleanup()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return toAuthUserSummary(user)
}

export async function requireCurrentUser() {
  scheduleExpiredAdminSessionCleanup()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return user
}

export async function loginAdminWithCredentials(
  input: unknown
): Promise<AuthMutationResult> {
  scheduleExpiredAdminSessionCleanup()
  const parsed = validateCredentials(input)

  if (!parsed.data) {
    return {
      error: parsed.error ?? '参数不合法',
      ok: false,
      status: 400,
    }
  }

  const user = await findUserByEmail(parsed.data.email)

  if (!user) {
    return {
      error: '邮箱或密码错误',
      ok: false,
      status: 401,
    }
  }

  const isValidPassword = await verifyPassword(
    parsed.data.password,
    user.passwordHash
  )

  if (!isValidPassword) {
    return {
      error: '邮箱或密码错误',
      ok: false,
      status: 401,
    }
  }

  const session = await createAuthSession(user.id)

  return {
    error: null,
    ok: true,
    session,
    status: 200,
    user: toAuthUserSummary(user),
  }
}

export async function logoutCurrentAdminUser() {
  await deleteCurrentSession()
}
