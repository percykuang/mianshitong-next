import type { CareerIntent } from '../shared'
import { CAREER_CAPABILITY_CONFIGS } from './config'
import type { CareerCapabilityConfig } from './types'

export function getCareerCapabilityConfig(intent: CareerIntent) {
  return CAREER_CAPABILITY_CONFIGS[intent]
}

export function getTaskCapabilityConfigs() {
  return Object.values(CAREER_CAPABILITY_CONFIGS).filter(
    (config) => config.intent !== 'general'
  ) as Array<
    CareerCapabilityConfig & { intent: Exclude<CareerIntent, 'general'> }
  >
}
