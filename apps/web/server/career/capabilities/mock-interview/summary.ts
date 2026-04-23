import {
  MOCK_INTERVIEW_CATEGORY_LABELS,
  getMockInterviewRuntimeStateFromSlots,
} from './runtime-state'

function formatCategoryList(categories: string[]) {
  if (categories.length === 0) {
    return '暂无'
  }

  return categories
    .map(
      (category) =>
        MOCK_INTERVIEW_CATEGORY_LABELS[
          category as keyof typeof MOCK_INTERVIEW_CATEGORY_LABELS
        ] ?? category
    )
    .join('、')
}

export function buildMockInterviewStateSummary(slots: Record<string, unknown>) {
  const state = getMockInterviewRuntimeStateFromSlots(slots)

  return [
    '当前模拟面试运行状态：',
    JSON.stringify(
      {
        candidateProfile: state.candidateProfile,
        coveredCategories:
          state.coveredCategories.length > 0
            ? formatCategoryList(state.coveredCategories)
            : '暂无',
        currentCategory: state.currentCategory
          ? MOCK_INTERVIEW_CATEGORY_LABELS[state.currentCategory]
          : null,
        currentQuestion: state.currentQuestion,
        finalSummaryReady: state.finalSummaryReady,
        followupDepth: state.followupDepth,
        plannedQuestionCount: state.plannedQuestionCount,
        projectSlots: state.projectSlots,
        questionIndex: state.questionIndex,
        remainingRequiredCategories:
          state.remainingRequiredCategories.length > 0
            ? formatCategoryList(state.remainingRequiredCategories)
            : '已全部覆盖',
        scorecard: state.scorecard,
        status: state.status,
      },
      null,
      2
    ),
  ].join('\n')
}
