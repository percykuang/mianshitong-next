import type { AuthFieldError } from '@/utils/auth'

import { hashPassword, verifyPassword } from '../password'
import { deleteCurrentSession, getCurrentUser } from '../session'
import {
  createAuthSession,
  createUser,
  findUserByEmail,
} from '../user-repository'
import {
  validateLoginCredentials,
  validateRegistrationCredentials,
} from '../validation'

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
      status: 200 | 201
      user: AuthUserSummary
    }
  | {
      error: string | AuthFieldError
      ok: false
      session?: never
      status: 400 | 401 | 409
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

function isUniqueEmailConstraintError(error: unknown) {
  if (
    !error ||
    typeof error !== 'object' ||
    !('code' in error) ||
    error.code !== 'P2002'
  ) {
    return false
  }

  const target =
    'meta' in error &&
    error.meta &&
    typeof error.meta === 'object' &&
    'target' in error.meta
      ? error.meta.target
      : undefined

  if (Array.isArray(target)) {
    return target.includes('email')
  }

  return true
}

export async function getCurrentAuthUserProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return toAuthUserSummary(user)
}

export async function loginWithCredentials(
  input: unknown
): Promise<AuthMutationResult> {
  const parsed = validateLoginCredentials(input)

  if (!parsed.data) {
    return {
      error: '邮箱或密码错误',
      ok: false,
      status: 401,
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

export async function registerWithCredentials(
  input: unknown
): Promise<AuthMutationResult> {
  const parsed = validateRegistrationCredentials(input)

  if (!parsed.data) {
    return {
      error: parsed.error ?? '参数不合法',
      ok: false,
      status: 400,
    }
  }

  const existingUser = await findUserByEmail(parsed.data.email)

  if (existingUser) {
    return {
      error: {
        field: 'email',
        message: '该邮箱已注册',
      },
      ok: false,
      status: 409,
    }
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const user = await createUser({
    email: parsed.data.email,
    passwordHash,
  }).catch((error: unknown) => {
    if (isUniqueEmailConstraintError(error)) {
      return null
    }

    throw error
  })

  if (!user) {
    return {
      error: {
        field: 'email',
        message: '该邮箱已注册',
      },
      ok: false,
      status: 409,
    }
  }

  const session = await createAuthSession(user.id)

  return {
    error: null,
    ok: true,
    session,
    status: 201,
    user: toAuthUserSummary(user),
  }
}

export async function logoutCurrentAuthUser() {
  await deleteCurrentSession()
}
