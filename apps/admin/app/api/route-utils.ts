import { NextResponse } from 'next/server'

import { requireCurrentUser } from '@/server'

type AdminRouteHandler = () => Promise<Response>

export function adminJsonError(message: string, status: number) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  )
}

export async function withAdminUser(handler: AdminRouteHandler) {
  const currentAdminUser = await requireCurrentUser()

  if (!currentAdminUser) {
    return adminJsonError('未登录或没有管理员权限', 401)
  }

  return handler()
}
