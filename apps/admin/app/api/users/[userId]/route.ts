import { NextResponse } from 'next/server'

import {
  deleteRegisteredUser,
  updateRegisteredUserDailyModelQuota,
} from '@/server'

import { adminJsonError, withAdminUser } from '../../route-utils'

interface UserRouteContext {
  params: Promise<{ userId: string }>
}

export async function DELETE(_request: Request, context: UserRouteContext) {
  return withAdminUser(async () => {
    const { userId } = await context.params
    const result = await deleteRegisteredUser({
      userId,
    })

    if (result.error === 'not_found') {
      return adminJsonError('用户不存在', 404)
    }

    return NextResponse.json({
      ok: true,
    })
  })
}

export async function PATCH(request: Request, context: UserRouteContext) {
  return withAdminUser(async () => {
    const payload = (await request.json().catch(() => null)) as {
      dailyModelQuota?: unknown
    } | null
    const dailyModelQuota = payload?.dailyModelQuota

    if (typeof dailyModelQuota !== 'number') {
      return adminJsonError('模型配额必须是数字', 400)
    }

    const { userId } = await context.params
    const result = await updateRegisteredUserDailyModelQuota({
      userId,
      dailyModelQuota,
    })

    if (result.error === 'invalid_quota') {
      return adminJsonError('模型配额必须是 0 到 100000 之间的整数', 400)
    }

    if (result.error === 'not_found') {
      return adminJsonError('用户不存在', 404)
    }

    return NextResponse.json({
      ok: true,
      dailyModelQuota: result.dailyModelQuota,
    })
  })
}
