import { db } from '@mianshitong/db'
import { isProductionEnv } from '@mianshitong/shared/runtime'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import 'server-only'

export const AUTH_SESSION_COOKIE_NAME = 'mst_admin_session'
const AUTH_SESSION_COOKIE_PATH = '/'

function createCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProductionEnv(),
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
  const sessionToken = await getAuthSessionToken()

  if (!sessionToken) {
    return null
  }

  return db.adminUser.findBySessionToken(sessionToken)
}

export async function deleteCurrentSession() {
  const sessionToken = await getAuthSessionToken()

  if (!sessionToken) {
    return
  }

  await db.adminUser.deleteSessionByToken(sessionToken)
}
