import type { CareerIntent } from './intent'

export type CareerFlowStatus = 'active' | 'cancelled' | 'completed' | 'paused'

export interface CareerPendingDecision {
  kind: string
  options: string[]
}

export interface CareerAssistantOffer {
  options: string[]
  type: string
}

export interface CareerFlowState {
  createdAt: string
  id: string
  intent: Exclude<CareerIntent, 'general'>
  lastAssistantOffer?: CareerAssistantOffer | null
  lastAssistantAction?: string
  lastUserAction?: string
  pendingDecision?: CareerPendingDecision | null
  phase: string
  slots: Record<string, unknown>
  status: CareerFlowStatus
  summary: string
  updatedAt: string
}
