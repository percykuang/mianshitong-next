import { NextResponse } from 'next/server'

import { clearAuthSessionCookie, logoutCurrentAuthUser } from '@/server/auth'

export async function POST() {
  await logoutCurrentAuthUser()

  const response = NextResponse.json({ ok: true })
  clearAuthSessionCookie(response)

  return response
}
