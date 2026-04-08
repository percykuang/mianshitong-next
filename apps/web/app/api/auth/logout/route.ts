import { NextResponse } from 'next/server'
import {
  clearAuthSessionCookie,
  deleteCurrentSession,
} from '@/server/auth-session'

export async function POST() {
  await deleteCurrentSession()

  const response = NextResponse.json({ ok: true })
  clearAuthSessionCookie(response)

  return response
}
