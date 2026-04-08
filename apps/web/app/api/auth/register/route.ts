import { NextResponse } from 'next/server'
import {
  createAuthSession,
  createUser,
  findUserByEmail,
} from '@/server/auth-user-repository'
import {
  setAuthSessionCookie,
  clearAuthSessionCookie,
} from '@/server/auth-session'
import { hashPassword } from '@/server/password'
import { validateCredentials } from '@/server/auth-validation'

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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = validateCredentials(body)

  if (!parsed.data) {
    return NextResponse.json(
      { error: parsed.error ?? '参数不合法' },
      { status: 400 }
    )
  }

  const existingUser = await findUserByEmail(parsed.data.email)

  if (existingUser) {
    return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
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
    return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
  }

  const session = await createAuthSession(user.id)
  const response = NextResponse.json(
    {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
      },
    },
    { status: 201 }
  )

  clearAuthSessionCookie(response)
  setAuthSessionCookie(response, session.sessionToken, session.maxAgeSeconds)

  return response
}
