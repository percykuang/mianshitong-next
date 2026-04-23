import { CAREER_BASE_ROLE_PROMPT } from './base-role'
import { CAREER_OUTPUT_RULES_PROMPT } from './output-rules'

export const CAREER_CHAT_POLICY_INSTRUCTION = [
  CAREER_BASE_ROLE_PROMPT,
  CAREER_OUTPUT_RULES_PROMPT,
].join('\n\n')
