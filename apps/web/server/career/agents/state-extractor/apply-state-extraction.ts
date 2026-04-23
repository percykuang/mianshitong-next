import {
  buildDefaultMockInterviewRuntimeState,
  getCareerCapabilityConfig,
} from '../../capabilities'
import type {
  CareerAssistantOffer,
  CareerFlowState,
  CareerFlowStatus,
  CareerIntent,
  CareerPendingDecision,
  CareerThreadState,
} from '../../shared'
import {
  activateCareerFlow,
  createCareerFlowState,
  touchCareerFlow,
  updateCareerThreadState,
} from '../../state'
import type { StateExtractorResult } from './schema'
import { getActiveFlow } from './state-payload'

function getFlowOrNull(state: CareerThreadState, flowId: string | undefined) {
  return flowId ? state.flows[flowId] : undefined
}

function isTaskIntent(
  intent: CareerIntent | undefined
): intent is Exclude<CareerIntent, 'general'> {
  return Boolean(intent && intent !== 'general')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeSlotValue(current: unknown, next: unknown) {
  if (isRecord(current) && isRecord(next)) {
    const merged: Record<string, unknown> = { ...current }

    for (const [key, value] of Object.entries(next)) {
      merged[key] = mergeSlotValue(current[key], value)
    }

    return merged
  }

  return next
}

function mergeSlots(
  currentSlots: Record<string, unknown>,
  nextSlots: Record<string, unknown> | undefined
) {
  if (!nextSlots) {
    return currentSlots
  }

  const mergedSlots: Record<string, unknown> = { ...currentSlots }

  for (const [key, value] of Object.entries(nextSlots)) {
    mergedSlots[key] = mergeSlotValue(currentSlots[key], value)
  }

  return mergedSlots
}

function buildDefaultFlowSlots(
  intent: Exclude<CareerIntent, 'general'>
): Record<string, unknown> {
  if (intent === 'mock_interview') {
    return {
      interviewState: buildDefaultMockInterviewRuntimeState(),
    }
  }

  return {}
}

function touchFlowWithPatch(input: {
  flow: CareerFlowState
  flowPatch: {
    lastAssistantAction?: string
    lastAssistantOffer?: CareerAssistantOffer | null
    lastUserAction?: string
    pendingDecision?: CareerPendingDecision | null
    phase?: string
    slots?: Record<string, unknown>
    status?: CareerFlowStatus
    summary?: string
  }
}) {
  return touchCareerFlow(input.flow, {
    lastAssistantAction:
      input.flowPatch.lastAssistantAction ?? input.flow.lastAssistantAction,
    lastAssistantOffer:
      input.flowPatch.lastAssistantOffer ??
      input.flow.lastAssistantOffer ??
      null,
    lastUserAction: input.flowPatch.lastUserAction ?? input.flow.lastUserAction,
    pendingDecision:
      input.flowPatch.pendingDecision ?? input.flow.pendingDecision ?? null,
    phase: input.flowPatch.phase ?? input.flow.phase,
    slots: mergeSlots(input.flow.slots, input.flowPatch.slots),
    status: input.flowPatch.status ?? input.flow.status,
    summary: input.flowPatch.summary ?? input.flow.summary,
  })
}

export function applyStateExtraction(input: {
  extraction: StateExtractorResult
  previousState: CareerThreadState
}) {
  const { extraction, previousState } = input
  const activeFlow = getActiveFlow(previousState)
  const flowPatch = extraction.flowPatch

  if (extraction.mode === 'no_state_change') {
    return previousState
  }

  if (extraction.mode === 'keep_active_flow') {
    if (!activeFlow) {
      return previousState
    }

    const nextFlow = touchFlowWithPatch({
      flow: activeFlow,
      flowPatch: flowPatch ?? {},
    })

    return updateCareerThreadState(previousState, {
      flows: {
        ...previousState.flows,
        [nextFlow.id]: nextFlow,
      },
    })
  }

  if (extraction.mode === 'start_new_flow') {
    if (!isTaskIntent(extraction.intent)) {
      return previousState
    }

    const capabilityConfig = getCareerCapabilityConfig(extraction.intent)
    const nextSlots = mergeSlots(
      buildDefaultFlowSlots(extraction.intent),
      flowPatch?.slots
    )
    const nextFlow = createCareerFlowState({
      intent: extraction.intent,
      lastAssistantAction: flowPatch?.lastAssistantAction,
      lastAssistantOffer: flowPatch?.lastAssistantOffer ?? null,
      lastUserAction: flowPatch?.lastUserAction,
      pendingDecision: flowPatch?.pendingDecision ?? null,
      phase: flowPatch?.phase ?? capabilityConfig.initialPhase,
      slots: nextSlots,
      summary: flowPatch?.summary ?? capabilityConfig.description,
    })

    return activateCareerFlow(previousState, nextFlow)
  }

  if (extraction.mode === 'activate_existing_flow') {
    const targetFlow = getFlowOrNull(previousState, extraction.flowId)

    if (!targetFlow) {
      return previousState
    }

    const activatedState = activateCareerFlow(previousState, targetFlow)
    const activatedFlow = activatedState.flows[targetFlow.id]
    const nextFlow = touchFlowWithPatch({
      flow: activatedFlow,
      flowPatch: flowPatch ?? {},
    })

    return updateCareerThreadState(activatedState, {
      flows: {
        ...activatedState.flows,
        [nextFlow.id]: nextFlow,
      },
    })
  }

  if (extraction.mode === 'complete_active_flow') {
    if (!activeFlow) {
      return previousState
    }

    const completedSlots =
      activeFlow.intent === 'mock_interview'
        ? mergeSlots(activeFlow.slots, {
            interviewState: {
              finalSummaryReady: true,
              status: 'completed',
            },
          })
        : activeFlow.slots
    const nextFlow = touchFlowWithPatch({
      flow: activeFlow,
      flowPatch: {
        ...flowPatch,
        phase: flowPatch?.phase ?? 'completed',
        slots: mergeSlots(completedSlots, flowPatch?.slots),
        status: flowPatch?.status ?? 'completed',
      },
    })

    return updateCareerThreadState(previousState, {
      activeFlowId:
        previousState.activeFlowId === nextFlow.id
          ? null
          : previousState.activeFlowId,
      flows: {
        ...previousState.flows,
        [nextFlow.id]: nextFlow,
      },
    })
  }

  if (extraction.mode === 'clear_active_flow') {
    if (!activeFlow) {
      return previousState
    }

    const nextFlow = touchFlowWithPatch({
      flow: activeFlow,
      flowPatch: {
        ...flowPatch,
        status: flowPatch?.status ?? 'paused',
      },
    })

    return updateCareerThreadState(previousState, {
      activeFlowId:
        previousState.activeFlowId === nextFlow.id
          ? null
          : previousState.activeFlowId,
      flows: {
        ...previousState.flows,
        [nextFlow.id]: nextFlow,
      },
    })
  }

  return previousState
}
