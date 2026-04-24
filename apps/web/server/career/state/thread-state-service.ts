import { prisma } from '@mianshitong/db'
import { createLogger } from '@mianshitong/shared/runtime'

import type { CareerThreadState } from '../shared'
import { createEmptyCareerThreadState } from './thread-state'

interface CareerThreadDelegate {
  deleteMany(input: { where: { chatSessionId: string } }): Promise<unknown>
  findUnique(input: {
    select: { state?: boolean; version: boolean }
    where: { chatSessionId: string }
  }): Promise<{ state?: unknown; version: number } | null>
  upsert(input: {
    create: { chatSessionId: string; state: unknown; version: number }
    update: { state: unknown; version: number }
    where: { chatSessionId: string }
  }): Promise<unknown>
}

const careerThreadClient = (
  prisma as unknown as {
    careerThread: CareerThreadDelegate
  }
).careerThread
const logger = createLogger('web.career.thread-state')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCareerThreadState(value: unknown): value is CareerThreadState {
  return (
    isRecord(value) &&
    (typeof value.activeFlowId === 'string' || value.activeFlowId === null) &&
    isRecord(value.flows) &&
    Array.isArray(value.recentFlowIds) &&
    Array.isArray(value.artifacts) &&
    typeof value.version === 'number'
  )
}

export async function loadCareerThreadState(chatSessionId: string) {
  const record = await careerThreadClient.findUnique({
    where: {
      chatSessionId,
    },
    select: {
      state: true,
      version: true,
    },
  })

  if (!record || !isCareerThreadState(record.state)) {
    return createEmptyCareerThreadState()
  }

  return {
    ...record.state,
    version: record.version,
  }
}

export async function commitCareerThreadState(input: {
  chatSessionId: string
  expectedVersion: number
  pendingState: CareerThreadState
}) {
  const existing = await careerThreadClient.findUnique({
    where: {
      chatSessionId: input.chatSessionId,
    },
    select: {
      version: true,
    },
  })

  const nextVersion = (existing?.version ?? 0) + 1
  const nextState = {
    ...input.pendingState,
    version: nextVersion,
  }

  if (existing && existing.version !== input.expectedVersion) {
    logger.warn('skip stale state commit', {
      chatSessionId: input.chatSessionId,
      expectedVersion: input.expectedVersion,
      actualVersion: existing.version,
    })

    return {
      committed: false,
      reason: 'version_mismatch' as const,
    }
  }

  await careerThreadClient.upsert({
    where: {
      chatSessionId: input.chatSessionId,
    },
    create: {
      chatSessionId: input.chatSessionId,
      state: nextState as never,
      version: nextVersion,
    },
    update: {
      state: nextState as never,
      version: nextVersion,
    },
  })

  return {
    committed: true,
    reason: null,
  }
}

export async function resetCareerThreadState(chatSessionId: string) {
  await careerThreadClient.deleteMany({
    where: {
      chatSessionId,
    },
  })
}
