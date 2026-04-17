import { NextResponse } from 'next/server'
import { logoutCurrentAdminUser } from '@/server/auth/service'
import { clearAuthSessionCookie } from '@/server/auth/session'

export async function POST() {
  await logoutCurrentAdminUser()

  const response = NextResponse.json({
    ok: true,
  })

  clearAuthSessionCookie(response)

  return response
}
