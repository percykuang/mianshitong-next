import { NextResponse } from 'next/server'

import { loginAdminWithCredentials } from '@/server/auth/service'
import { setAuthSessionCookie } from '@/server/auth/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const result = await loginAdminWithCredentials(body)

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
      },
      {
        status: result.status,
      }
    )
  }

  const response = NextResponse.json({
    user: result.user,
  })

  setAuthSessionCookie(
    response,
    result.session.sessionToken,
    result.session.maxAgeSeconds
  )

  return response
}
