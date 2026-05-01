import { NextResponse } from 'next/server'

import { createAdminChatModel } from '@/server'

import { adminJsonError, withAdminUser } from '../route-utils'

export async function POST(request: Request) {
  return withAdminUser(async () => {
    const payload = await request.json().catch(() => null)
    const result = await createAdminChatModel(payload)

    if (!result.ok) {
      return adminJsonError(result.error, result.status)
    }

    return NextResponse.json({
      ok: true,
    })
  })
}
