import { CAREER_CHAT_POLICY_INSTRUCTION } from '../../shared'
import type {
  CareerMessage,
  CareerStateCommit,
  CareerThreadState,
} from '../../shared'
import { applyStateExtraction } from './apply-state-extraction'
import { invokeCareerStructuredModel } from './invoke-structured-model'
import { CAREER_STATE_EXTRACTOR_PROMPT } from './prompt'
import {
  STATE_EXTRACTOR_JSON_FALLBACK_PROMPT,
  stateExtractorSchema,
} from './schema'
import { buildStateExtractorPayload } from './state-payload'

export async function extractCareerStateAfterReply(input: {
  assistantReply: string
  chatSessionId: string
  messages: CareerMessage[]
  modelId: string
  previousState: CareerThreadState
  userInput: string
}): Promise<CareerStateCommit | undefined> {
  const extraction = await invokeCareerStructuredModel({
    label: 'state extractor',
    modelId: input.modelId,
    schema: stateExtractorSchema,
    systemPrompt: [
      CAREER_CHAT_POLICY_INSTRUCTION,
      CAREER_STATE_EXTRACTOR_PROMPT,
    ].join('\n\n'),
    userPayload: buildStateExtractorPayload(input),
    jsonFallbackPrompt: STATE_EXTRACTOR_JSON_FALLBACK_PROMPT,
  })

  const pendingState = applyStateExtraction({
    extraction,
    previousState: input.previousState,
  })

  if (pendingState === input.previousState) {
    return undefined
  }

  return {
    chatSessionId: input.chatSessionId,
    expectedVersion: input.previousState.version,
    pendingState,
  }
}
