import { z } from 'zod'

export const MOCK_INTERVIEW_REQUIRED_CATEGORIES = [
  'self_intro',
  'fundamentals',
  'coding',
  'system_design',
  'project_intro',
  'project_challenge',
  'performance_optimization',
  'candidate_questions',
] as const

export const MOCK_INTERVIEW_CATEGORY_LABELS = {
  self_intro: '自我介绍',
  fundamentals: '基础题',
  coding: '代码题',
  system_design: '场景设计题',
  project_intro: '项目介绍',
  project_challenge: '项目难点追问',
  performance_optimization: '性能优化追问',
  candidate_questions: '反问环节',
  tech_stack_switch: '技术栈迁移追问',
  job_change_reason: '离职原因',
  behavioral: '行为面',
} as const

export const mockInterviewCategorySchema = z.enum([
  ...MOCK_INTERVIEW_REQUIRED_CATEGORIES,
  'tech_stack_switch',
  'job_change_reason',
  'behavioral',
])

const mockInterviewRequiredCategorySchema = z.enum(
  MOCK_INTERVIEW_REQUIRED_CATEGORIES
)

export const mockInterviewStatusSchema = z.enum([
  'not_started',
  'opening',
  'awaiting_answer',
  'evaluating_answer',
  'asking_followup',
  'asking_next_question',
  'closing',
  'completed',
])

const mockInterviewCandidateProfileSchema = z
  .object({
    preferredStack: z.array(z.string().trim().min(1)).optional(),
    targetCompanyType: z.string().trim().min(1).optional(),
    targetRole: z.string().trim().min(1).optional(),
    yearsOfExperience: z.string().trim().min(1).optional(),
  })
  .partial()

const mockInterviewProjectSlotSchema = z
  .object({
    challengeMentioned: z.boolean().optional(),
    name: z.string().trim().min(1).optional(),
    performanceMentioned: z.boolean().optional(),
    summary: z.string().trim().min(1).optional(),
    techTags: z.array(z.string().trim().min(1)).optional(),
  })
  .partial()

const mockInterviewScorecardSchema = z
  .object({
    coding: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    engineering: z.number().min(1).max(5).optional(),
    fundamentals: z.number().min(1).max(5).optional(),
    interviewMindset: z.number().min(1).max(5).optional(),
    performance: z.number().min(1).max(5).optional(),
    projectDepth: z.number().min(1).max(5).optional(),
    systemDesign: z.number().min(1).max(5).optional(),
  })
  .partial()

const mockInterviewRuntimeStatePatchSchema = z
  .object({
    candidateProfile: mockInterviewCandidateProfileSchema.optional(),
    coveredCategories: z.array(mockInterviewCategorySchema).optional(),
    currentCategory: mockInterviewCategorySchema.nullable().optional(),
    currentQuestion: z.string().trim().min(1).nullable().optional(),
    currentQuestionId: z.string().trim().min(1).nullable().optional(),
    finalSummaryReady: z.boolean().optional(),
    followupDepth: z.number().int().min(0).optional(),
    plannedQuestionCount: z.number().int().min(8).max(10).optional(),
    projectSlots: z.array(mockInterviewProjectSlotSchema).optional(),
    questionIndex: z.number().int().min(0).optional(),
    remainingRequiredCategories: z
      .array(mockInterviewRequiredCategorySchema)
      .optional(),
    scorecard: mockInterviewScorecardSchema.optional(),
    status: mockInterviewStatusSchema.optional(),
  })
  .partial()

export type MockInterviewCategory = z.infer<typeof mockInterviewCategorySchema>
export type MockInterviewStatus = z.infer<typeof mockInterviewStatusSchema>

export interface MockInterviewRuntimeState {
  candidateProfile: Partial<{
    preferredStack: string[]
    targetCompanyType: string
    targetRole: string
    yearsOfExperience: string
  }>
  coveredCategories: MockInterviewCategory[]
  currentCategory: MockInterviewCategory | null
  currentQuestion: string | null
  currentQuestionId: string | null
  finalSummaryReady: boolean
  followupDepth: number
  plannedQuestionCount: number
  projectSlots: Array<{
    challengeMentioned?: boolean
    name?: string
    performanceMentioned?: boolean
    summary?: string
    techTags?: string[]
  }>
  questionIndex: number
  remainingRequiredCategories: Array<
    (typeof MOCK_INTERVIEW_REQUIRED_CATEGORIES)[number]
  >
  scorecard: Partial<{
    coding: number
    communication: number
    engineering: number
    fundamentals: number
    interviewMindset: number
    performance: number
    projectDepth: number
    systemDesign: number
  }>
  status: MockInterviewStatus
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function dedupeCategories<T extends string>(categories: T[]) {
  return Array.from(new Set(categories))
}

function filterRequiredCategories(categories: MockInterviewCategory[]) {
  return categories.filter(
    (
      category
    ): category is (typeof MOCK_INTERVIEW_REQUIRED_CATEGORIES)[number] =>
      MOCK_INTERVIEW_REQUIRED_CATEGORIES.includes(
        category as (typeof MOCK_INTERVIEW_REQUIRED_CATEGORIES)[number]
      )
  )
}

function deriveRemainingRequiredCategories(
  coveredCategories: MockInterviewCategory[]
) {
  const coveredRequiredCategories = new Set(
    filterRequiredCategories(coveredCategories)
  )

  return MOCK_INTERVIEW_REQUIRED_CATEGORIES.filter(
    (category) => !coveredRequiredCategories.has(category)
  )
}

export function buildDefaultMockInterviewRuntimeState(): MockInterviewRuntimeState {
  return {
    candidateProfile: {},
    coveredCategories: [],
    currentCategory: null,
    currentQuestion: null,
    currentQuestionId: null,
    finalSummaryReady: false,
    followupDepth: 0,
    plannedQuestionCount: 9,
    projectSlots: [],
    questionIndex: 0,
    remainingRequiredCategories: [...MOCK_INTERVIEW_REQUIRED_CATEGORIES],
    scorecard: {},
    status: 'opening',
  }
}

export function getMockInterviewRuntimeStateFromSlots(
  slots: Record<string, unknown>
): MockInterviewRuntimeState {
  const rawInterviewState = isRecord(slots.interviewState)
    ? slots.interviewState
    : {}
  const parsed =
    mockInterviewRuntimeStatePatchSchema.safeParse(rawInterviewState)
  const baseState = buildDefaultMockInterviewRuntimeState()

  if (!parsed.success) {
    return baseState
  }

  const coveredCategories = dedupeCategories(
    parsed.data.coveredCategories ?? baseState.coveredCategories
  )
  const remainingRequiredCategories = dedupeCategories(
    parsed.data.remainingRequiredCategories ??
      deriveRemainingRequiredCategories(coveredCategories)
  )

  return {
    ...baseState,
    ...parsed.data,
    candidateProfile: {
      ...baseState.candidateProfile,
      ...(parsed.data.candidateProfile ?? {}),
    },
    coveredCategories,
    projectSlots: parsed.data.projectSlots ?? baseState.projectSlots,
    remainingRequiredCategories,
    scorecard: {
      ...baseState.scorecard,
      ...(parsed.data.scorecard ?? {}),
    },
  }
}
