import 'server-only'
import { createAuthSession, findUserByEmail } from './user-repository'
import { deleteCurrentSession, getCurrentUser } from './session'
import { verifyPassword } from './password'
import { validateCredentials } from './validation'

type AdminUserRole = 'admin' | 'user'

export interface UserSummary {
  email: string
  id: string
  role: AdminUserRole
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
      user: UserSummary
    }
  | {
      error: string
      ok: false
      session?: never
      status: 400 | 401 | 403
      user?: never
    }

function toUserSummary(user: {
  email: string
  id: string
  role: AdminUserRole
}): UserSummary {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}

function isAdminRole(role: AdminUserRole) {
  return role === 'admin'
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser()

  if (!user || !isAdminRole(user.role)) {
    return null
  }

  return toUserSummary(user)
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user || !isAdminRole(user.role)) {
    return null
  }

  return user
}

export async function loginAdminWithCredentials(
  input: unknown
): Promise<AuthMutationResult> {
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

  if (!isAdminRole(user.role)) {
    return {
      error: '当前账号没有后台访问权限',
      ok: false,
      status: 403,
    }
  }

  const session = await createAuthSession(user.id)

  return {
    error: null,
    ok: true,
    session,
    status: 200,
    user: toUserSummary(user),
  }
}

export async function logoutCurrentAdminUser() {
  await deleteCurrentSession()
}
