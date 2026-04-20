import { prisma, resolveUserActorDailyModelQuota } from '@mianshitong/db'
import 'server-only'

import type { ChatUsageSummary } from '@/app/chat/domain'

import type { ChatActor } from '../actor'

function createTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 1)

  return {
    end,
    start,
  }
}

export async function getChatUsageSummary(
  actor: ChatActor
): Promise<ChatUsageSummary> {
  const todayRange = createTodayRange()
  const [actorRecord, used] = await Promise.all([
    prisma.userActor.findUnique({
      where: {
        id: actor.id,
      },
      select: {
        dailyModelQuota: true,
        type: true,
      },
    }),
    prisma.chatReplyUsage.count({
      where: {
        createdAt: {
          gte: todayRange.start,
          lt: todayRange.end,
        },
        actorId: actor.id,
      },
    }),
  ])
  const max = resolveUserActorDailyModelQuota({
    type: actorRecord?.type ?? actor.type,
    dailyModelQuota: actorRecord?.dailyModelQuota,
  })

  return {
    max,
    used,
  }
}

export async function checkChatQuota(actor: ChatActor) {
  const usage = await getChatUsageSummary(actor)

  return {
    exceeded: usage.used >= usage.max,
    usage,
  }
}
