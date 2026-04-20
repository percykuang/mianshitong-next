import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { deleteSessionByToken, findUserBySessionToken } from './user-repository'

export const AUTH_SESSION_COOKIE_NAME = 'mst_session'
const AUTH_SESSION_COOKIE_PATH = '/'

function createCookieOptions(maxAge?: number) {
  return {
    // 只让服务端读写 cookie，浏览器脚本拿不到 session token。
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: AUTH_SESSION_COOKIE_PATH,
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  }
}

async function getAuthSessionToken() {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value
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

export function replaceAuthSessionCookie(
  response: NextResponse,
  session: { maxAgeSeconds: number; sessionToken: string }
) {
  clearAuthSessionCookie(response)
  setAuthSessionCookie(response, session.sessionToken, session.maxAgeSeconds)
}

export async function getCurrentUser() {
  const sessionToken = await getAuthSessionToken()

  if (!sessionToken) {
    return null
  }

  return findUserBySessionToken(sessionToken)
}

export async function deleteCurrentSession() {
  const sessionToken = await getAuthSessionToken()

  if (!sessionToken) {
    return
  }

  await deleteSessionByToken(sessionToken)
}
