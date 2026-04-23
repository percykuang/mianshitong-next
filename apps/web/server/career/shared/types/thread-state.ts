import type { CareerFlowState } from './flow'

export interface CareerArtifactRef {
  flowId?: string
  id: string
  summary: string
  type: string
}

export interface CareerThreadState {
  activeFlowId: string | null
  artifacts: CareerArtifactRef[]
  flows: Record<string, CareerFlowState>
  recentFlowIds: string[]
  updatedAt: string
  version: number
}

export interface CareerStateCommit {
  chatSessionId: string
  expectedVersion: number
  pendingState: CareerThreadState
}
