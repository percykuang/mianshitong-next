import { db } from '@mianshitong/db'
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
    db.userActor.findQuotaById(actor.id),
    db.userActor.countReplyUsageInRange({
      actorId: actor.id,
      start: todayRange.start,
      end: todayRange.end,
    }),
  ])
  const max = db.userActor.resolveDailyModelQuota({
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
