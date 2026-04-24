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

function optionalFromNull<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    schema.optional()
  )
}

function stringWithDefault(defaultValue: string) {
  return z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() ? value : defaultValue,
    z.string().trim().min(1)
  )
}

function emptyOptionsObjectToNull(value: unknown) {
  if (!value || typeof value !== 'object' || !('options' in value)) {
    return value
  }

  const options = value.options
  return Array.isArray(options) && options.length === 0 ? null : value
}

const flowPatchSchema = z.object({
  lastAssistantAction: optionalFromNull(z.string().trim()),
  lastAssistantOffer: z.preprocess(
    emptyOptionsObjectToNull,
    z
      .object({
        options: z.array(z.string().trim().min(1)).min(1),
        type: z.string().trim().min(1),
      })
      .nullable()
      .optional()
  ),
  lastUserAction: optionalFromNull(z.string().trim()),
  pendingDecision: z.preprocess(
    emptyOptionsObjectToNull,
    z
      .object({
        kind: z.string().trim().min(1),
        options: z.array(z.string().trim().min(1)).min(1),
      })
      .nullable()
      .optional()
  ),
  phase: optionalFromNull(z.string().trim()),
  slots: optionalFromNull(z.record(z.unknown())),
  status: optionalFromNull(
    z.enum(['active', 'cancelled', 'completed', 'paused'])
  ),
  summary: optionalFromNull(z.string().trim()),
})

export const stateExtractorSchema = z.object({
  confidence: z.number().min(0).max(1),
  flowId: optionalFromNull(z.string().trim()),
  flowPatch: optionalFromNull(flowPatchSchema),
  intent: optionalFromNull(taskIntentSchema),
  mode: z.enum([
    'activate_existing_flow',
    'clear_active_flow',
    'complete_active_flow',
    'keep_active_flow',
    'no_state_change',
    'start_new_flow',
  ]),
  reason: stringWithDefault('模型未提供原因'),
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

如果没有待选择项或上一轮选项，请把 pendingDecision / lastAssistantOffer 输出为 null，不要输出空 options 数组。
`.trim()
