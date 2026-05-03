import { db } from '@mianshitong/db'
import { createLogger } from '@mianshitong/shared/runtime'
import 'server-only'

const CLEANUP_INTERVAL_MS = 1000 * 60 * 60
const logger = createLogger('admin.auth.cleanup')

let activeCleanupPromise: Promise<void> | null = null
let nextCleanupAt = 0

function shouldRunCleanup(now: number) {
  return activeCleanupPromise === null && now >= nextCleanupAt
}

export function scheduleExpiredAdminSessionCleanup() {
  const now = Date.now()

  if (!shouldRunCleanup(now)) {
    return
  }

  nextCleanupAt = now + CLEANUP_INTERVAL_MS
  activeCleanupPromise = db.adminUser
    .deleteExpiredSessions()
    .catch((error) => {
      logger.warn('cleanup expired sessions failed', error)
      nextCleanupAt = 0
    })
    .finally(() => {
      activeCleanupPromise = null
    })
}
