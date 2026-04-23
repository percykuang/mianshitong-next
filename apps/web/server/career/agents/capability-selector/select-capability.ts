import { getTaskCapabilityConfigs } from '../../capabilities'
import type { CareerMessage } from '../../shared'
import { CAREER_CHAT_POLICY_INSTRUCTION } from '../../shared'
import { invokeCareerStructuredModel } from '../state-extractor'
import { CAREER_CAPABILITY_SELECTOR_PROMPT } from './prompt'
import {
  CAPABILITY_SELECTOR_JSON_FALLBACK_PROMPT,
  type CapabilitySelectorResult,
  capabilitySelectorSchema,
} from './schema'

function buildCapabilityCatalog() {
  return getTaskCapabilityConfigs().map((config) => ({
    description: config.description,
    entryGuidance: config.entryGuidance,
    intent: config.intent,
    label: config.label,
  }))
}

export async function selectCareerCapability(input: {
  messages: CareerMessage[]
  userInput: string
}): Promise<CapabilitySelectorResult> {
  return invokeCareerStructuredModel({
    jsonFallbackPrompt: CAPABILITY_SELECTOR_JSON_FALLBACK_PROMPT,
    label: 'capability selector',
    schema: capabilitySelectorSchema,
    systemPrompt: [
      CAREER_CHAT_POLICY_INSTRUCTION,
      CAREER_CAPABILITY_SELECTOR_PROMPT,
    ].join('\n\n'),
    userPayload: {
      capabilityCatalog: buildCapabilityCatalog(),
      recentMessages: input.messages.slice(-6),
      userInput: input.userInput,
    },
  })
}
