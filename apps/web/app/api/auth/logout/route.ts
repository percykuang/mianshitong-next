import { NextResponse } from 'next/server'
import { logoutCurrentAuthUser } from '@/server/auth/services'
import { clearAuthSessionCookie } from '@/server/auth/session'

export async function POST() {
  await logoutCurrentAuthUser()

  const response = NextResponse.json({ ok: true })
  clearAuthSessionCookie(response)

  return response
}
