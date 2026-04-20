import { NextResponse } from 'next/server'

import { getChatUsageSummary } from '@/server/chat/services'

import { withChatActor } from '../utils'

export async function GET() {
  return withChatActor(async (actor) => {
    const usage = await getChatUsageSummary(actor)

    return NextResponse.json(usage)
  })
}
