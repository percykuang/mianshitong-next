import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/server/auth/service'
import { deleteAdminSession } from '@/server/session/service'

interface DeleteSessionRouteContext {
  params: Promise<{ sessionId: string }>
}

export async function DELETE(
  _request: Request,
  context: DeleteSessionRouteContext
) {
  const currentAdminUser = await requireCurrentUser()

  if (!currentAdminUser) {
    return NextResponse.json(
      {
        error: '未登录或没有管理员权限',
      },
      {
        status: 401,
      }
    )
  }

  const { sessionId } = await context.params
  const isDeleted = await deleteAdminSession(sessionId)

  if (!isDeleted) {
    return NextResponse.json(
      {
        error: '会话不存在',
      },
      {
        status: 404,
      }
    )
  }

  return NextResponse.json({
    ok: true,
  })
}
