import { NextResponse } from 'next/server'

import { clearAuthSessionCookie, logoutCurrentAdminUser } from '@/server'

export async function POST() {
  await logoutCurrentAdminUser()

  const response = NextResponse.json({
    ok: true,
  })

  clearAuthSessionCookie(response)

  return response
}
