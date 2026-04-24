import { parseJsonSafely } from '@mianshitong/shared/runtime'
import { NextResponse } from 'next/server'

import { loginWithCredentials, replaceAuthSessionCookie } from '@/server/auth'

export async function POST(request: Request) {
  const body = await parseJsonSafely(request)
  const result = await loginWithCredentials(body)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      id: result.user.id,
      email: result.user.email,
    },
  })

  replaceAuthSessionCookie(response, result.session)

  return response
}
