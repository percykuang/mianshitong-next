import { NextResponse } from 'next/server'

import { deleteAdminSession } from '@/server'

import { adminJsonError, withAdminUser } from '../../route-utils'

interface DeleteSessionRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function DELETE(
  _request: Request,
  context: DeleteSessionRouteContext
) {
  return withAdminUser(async () => {
    const { sessionId } = await context.params
    const isDeleted = await deleteAdminSession(sessionId)

    if (!isDeleted) {
      return adminJsonError('会话不存在', 404)
    }

    return NextResponse.json({
      ok: true,
    })
  })
}
