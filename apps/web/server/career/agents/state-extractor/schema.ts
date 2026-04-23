import { z } from 'zod'

const taskIntentSchema = z.enum([
  'frontend_learning',
  'frontend_other',
  'frontend_qa',
  'mock_interview',
  'project_highlight',
  'resume_optimize',
  'self_intro',
])

const flowPatchSchema = z.object({
  lastAssistantAction: z.string().trim().optional(),
  lastAssistantOffer: z
    .object({
      options: z.array(z.string().trim().min(1)).min(1),
      type: z.string().trim().min(1),
    })
    .nullable()
    .optional(),
  lastUserAction: z.string().trim().optional(),
  pendingDecision: z
    .object({
      kind: z.string().trim().min(1),
      options: z.array(z.string().trim().min(1)).min(1),
    })
    .nullable()
    .optional(),
  phase: z.string().trim().optional(),
  slots: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'cancelled', 'completed', 'paused']).optional(),
  summary: z.string().trim().optional(),
})

export const stateExtractorSchema = z.object({
  confidence: z.number().min(0).max(1),
  flowId: z.string().trim().optional(),
  flowPatch: flowPatchSchema.optional(),
  intent: taskIntentSchema.optional(),
  mode: z.enum([
    'activate_existing_flow',
    'clear_active_flow',
    'complete_active_flow',
    'keep_active_flow',
    'no_state_change',
    'start_new_flow',
  ]),
  reason: z.string().trim().min(1),
})

export type StateExtractorResult = z.infer<typeof stateExtractorSchema>

export const STATE_EXTRACTOR_JSON_FALLBACK_PROMPT = `
请只输出一个 JSON 对象，不要输出 Markdown，不要输出代码块，不要添加解释。

JSON 必须符合下面结构：
{
  "mode": "keep_active_flow | start_new_flow | activate_existing_flow | complete_active_flow | clear_active_flow | no_state_change",
  "intent": "frontend_learning | frontend_other | frontend_qa | mock_interview | project_highlight | resume_optimize | self_intro",
  "flowId": "已有 flowId，可选",
  "confidence": 0.9,
  "reason": "简短字符串",
  "flowPatch": {
    "phase": "短阶段名，可选",
    "summary": "短摘要，可选",
    "lastAssistantAction": "本轮助手动作，可选",
    "lastUserAction": "本轮用户动作，可选",
    "pendingDecision": {
      "kind": "待用户选择主题",
      "options": ["选项一", "选项二"]
    },
    "lastAssistantOffer": {
      "type": "上一轮提供的选项类别",
      "options": ["选项一", "选项二"]
    },
    "slots": {
      "interviewState": {}
    },
    "status": "active"
  }
}
`.trim()
