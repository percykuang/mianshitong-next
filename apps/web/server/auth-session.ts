import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  deleteSessionByToken,
  findUserBySessionToken,
} from './auth-user-repository'

export const AUTH_SESSION_COOKIE_NAME = 'mst_session'

function createCookieOptions(maxAge?: number) {
  return {
    // 只让服务端读写 cookie，浏览器脚本拿不到 session token。
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  }
}

export function setAuthSessionCookie(
  response: NextResponse,
  sessionToken: string,
  maxAge: number
) {
  // cookie 生命周期与数据库里的 session 过期时间保持一致。
  response.cookies.set(
    AUTH_SESSION_COOKIE_NAME,
    sessionToken,
    createCookieOptions(maxAge)
  )
}

export function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, '', createCookieOptions(0))
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  return findUserBySessionToken(sessionToken)
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return
  }

  await deleteSessionByToken(sessionToken)
}
