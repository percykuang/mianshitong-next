import { NextResponse } from 'next/server'

import { getCurrentAuthUserProfile } from '@/server/auth'

export async function GET() {
  return NextResponse.json({
    user: await getCurrentAuthUserProfile(),
  })
}
