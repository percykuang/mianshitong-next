import { z } from 'zod'

export const capabilitySelectorSchema = z.object({
  confidence: z.number().min(0).max(1),
  intent: z
    .enum([
      'frontend_learning',
      'frontend_other',
      'frontend_qa',
      'mock_interview',
      'project_highlight',
      'resume_optimize',
      'self_intro',
    ])
    .nullable(),
  reason: z.string().trim().min(1),
})

export type CapabilitySelectorResult = z.infer<typeof capabilitySelectorSchema>

export const CAPABILITY_SELECTOR_JSON_FALLBACK_PROMPT = `
请只输出一个 JSON 对象，不要输出 Markdown，不要输出代码块，不要添加解释。

JSON 必须符合下面结构：
{
  "intent": "frontend_learning | frontend_other | frontend_qa | mock_interview | project_highlight | resume_optimize | self_intro | null",
  "confidence": 0.9,
  "reason": "简短字符串"
}
`.trim()
