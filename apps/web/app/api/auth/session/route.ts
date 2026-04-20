import { NextResponse } from 'next/server'

import { getCurrentAuthUserProfile } from '@/server/auth/services'

export async function GET() {
  return NextResponse.json({
    user: await getCurrentAuthUserProfile(),
  })
}
