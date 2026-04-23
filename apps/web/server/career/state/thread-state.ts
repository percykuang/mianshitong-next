import { randomUUID } from 'node:crypto'

import type {
  CareerFlowState,
  CareerIntent,
  CareerThreadState,
} from '../shared'

function createTimestamp() {
  return new Date().toISOString()
}

export function createEmptyCareerThreadState(): CareerThreadState {
  return {
    activeFlowId: null,
    artifacts: [],
    flows: {},
    recentFlowIds: [],
    updatedAt: createTimestamp(),
    version: 1,
  }
}

export function createCareerFlowState(input: {
  intent: Exclude<CareerIntent, 'general'>
  lastAssistantAction?: string
  lastAssistantOffer?: CareerFlowState['lastAssistantOffer']
  lastUserAction?: string
  pendingDecision?: CareerFlowState['pendingDecision']
  phase: string
  slots?: Record<string, unknown>
  summary: string
}): CareerFlowState {
  const now = createTimestamp()

  return {
    id: `${input.intent}-${randomUUID()}`,
    intent: input.intent,
    lastAssistantAction: input.lastAssistantAction,
    lastAssistantOffer: input.lastAssistantOffer ?? null,
    lastUserAction: input.lastUserAction,
    pendingDecision: input.pendingDecision ?? null,
    status: 'active',
    phase: input.phase,
    slots: input.slots ?? {},
    summary: input.summary,
    createdAt: now,
    updatedAt: now,
  }
}

export function touchCareerFlow(
  flow: CareerFlowState,
  update: Partial<
    Pick<
      CareerFlowState,
      | 'lastAssistantOffer'
      | 'lastAssistantAction'
      | 'lastUserAction'
      | 'pendingDecision'
      | 'phase'
      | 'slots'
      | 'status'
      | 'summary'
    >
  >
): CareerFlowState {
  return {
    ...flow,
    ...update,
    updatedAt: createTimestamp(),
  }
}

export function normalizeRecentFlowIds(input: {
  flowId: string
  recentFlowIds: string[]
}) {
  return [
    input.flowId,
    ...input.recentFlowIds.filter((flowId) => flowId !== input.flowId),
  ].slice(0, 8)
}

export function activateCareerFlow(
  state: CareerThreadState,
  flow: CareerFlowState
): CareerThreadState {
  const flows = { ...state.flows }
  const previousActiveFlow =
    state.activeFlowId && flows[state.activeFlowId]
      ? flows[state.activeFlowId]
      : null

  if (previousActiveFlow && previousActiveFlow.id !== flow.id) {
    flows[previousActiveFlow.id] = touchCareerFlow(previousActiveFlow, {
      status: 'paused',
    })
  }

  flows[flow.id] = touchCareerFlow(flow, {
    status: 'active',
  })

  return {
    ...state,
    activeFlowId: flow.id,
    flows,
    recentFlowIds: normalizeRecentFlowIds({
      flowId: flow.id,
      recentFlowIds: state.recentFlowIds,
    }),
    updatedAt: createTimestamp(),
  }
}

export function updateCareerThreadState(
  state: CareerThreadState,
  update: Partial<
    Pick<CareerThreadState, 'activeFlowId' | 'artifacts' | 'flows'>
  >
): CareerThreadState {
  return {
    ...state,
    ...update,
    updatedAt: createTimestamp(),
  }
}
