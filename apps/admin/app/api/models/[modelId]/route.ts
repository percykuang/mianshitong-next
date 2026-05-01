import { NextResponse } from 'next/server'

import { deleteAdminChatModel, updateAdminChatModel } from '@/server'

import { adminJsonError, withAdminUser } from '../../route-utils'

interface ModelRouteContext {
  params: Promise<{ modelId: string }>
}

export async function PATCH(request: Request, context: ModelRouteContext) {
  return withAdminUser(async () => {
    const payload = await request.json().catch(() => null)
    const { modelId } = await context.params
    const result = await updateAdminChatModel(modelId, payload)

    if (!result.ok) {
      return adminJsonError(result.error, result.status)
    }

    return NextResponse.json({
      ok: true,
    })
  })
}

export async function DELETE(_request: Request, context: ModelRouteContext) {
  return withAdminUser(async () => {
    const { modelId } = await context.params
    const result = await deleteAdminChatModel(modelId)

    if (!result.ok) {
      return adminJsonError(result.error, result.status)
    }

    return NextResponse.json({
      ok: true,
    })
  })
}
