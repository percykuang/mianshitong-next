import { NextResponse } from 'next/server'
import {
  createAuthSession,
  findUserByEmail,
} from '@/server/auth-user-repository'
import {
  clearAuthSessionCookie,
  setAuthSessionCookie,
} from '@/server/auth-session'
import { validateCredentials } from '@/server/auth-validation'
import { verifyPassword } from '@/server/password'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = validateCredentials(body)

  if (!parsed.data) {
    return NextResponse.json(
      { error: parsed.error ?? '参数不合法' },
      { status: 400 }
    )
  }

  const user = await findUserByEmail(parsed.data.email)

  if (!user) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }

  const isValidPassword = await verifyPassword(
    parsed.data.password,
    user.passwordHash
  )

  if (!isValidPassword) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
  }

  const session = await createAuthSession(user.id)
  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
    },
  })

  clearAuthSessionCookie(response)
  setAuthSessionCookie(response, session.sessionToken, session.maxAgeSeconds)

  return response
}
