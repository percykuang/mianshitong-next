import { NextResponse } from 'next/server'
import {
  deleteAdminUser,
  updateAdminUserDailyModelQuota,
} from '@/server/user/service'
import { requireCurrentUser } from '@/server/auth/service'

interface UserRouteContext {
  params: Promise<{ userId: string }>
}

export async function DELETE(_request: Request, context: UserRouteContext) {
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

  const { userId } = await context.params
  const result = await deleteAdminUser({
    currentAdminId: currentAdminUser.id,
    userId,
  })

  if (result.error === 'cannot_delete_self') {
    return NextResponse.json(
      {
        error: '不能删除当前登录的管理员账号',
      },
      {
        status: 400,
      }
    )
  }

  if (result.error === 'not_found') {
    return NextResponse.json(
      {
        error: '用户不存在',
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

export async function PATCH(request: Request, context: UserRouteContext) {
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

  const payload = (await request.json().catch(() => null)) as {
    dailyModelQuota?: unknown
  } | null
  const dailyModelQuota = payload?.dailyModelQuota

  if (typeof dailyModelQuota !== 'number') {
    return NextResponse.json(
      {
        error: '模型配额必须是数字',
      },
      {
        status: 400,
      }
    )
  }

  const { userId } = await context.params
  const result = await updateAdminUserDailyModelQuota({
    userId,
    dailyModelQuota,
  })

  if (result.error === 'invalid_quota') {
    return NextResponse.json(
      {
        error: '模型配额必须是 0 到 100000 之间的整数',
      },
      {
        status: 400,
      }
    )
  }

  if (result.error === 'not_found') {
    return NextResponse.json(
      {
        error: '用户不存在',
      },
      {
        status: 404,
      }
    )
  }

  return NextResponse.json({
    ok: true,
    dailyModelQuota: result.dailyModelQuota,
  })
}
