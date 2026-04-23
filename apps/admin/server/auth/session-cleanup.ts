import { createLogger } from '@mianshitong/shared'
import 'server-only'

import { deleteExpiredSessions } from './user-repository'

const CLEANUP_INTERVAL_MS = 1000 * 60 * 60
const logger = createLogger('admin-auth')

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
  activeCleanupPromise = deleteExpiredSessions()
    .catch((error) => {
      logger.warn('cleanup expired sessions failed', error)
      nextCleanupAt = 0
    })
    .finally(() => {
      activeCleanupPromise = null
    })
}
