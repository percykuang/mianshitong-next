import type { CareerIntent } from '../shared'

export interface CareerCapabilityConfig {
  description: string
  entryGuidance: string
  handoffGuidance: string
  initialPhase: string
  intent: CareerIntent
  label: string
  prompt: string
}
