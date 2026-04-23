import {
  CAREER_CAPABILITY_CONFIGS,
  getTaskCapabilityConfigs,
} from '../../capabilities'
import { buildMockInterviewStateSummary } from '../../capabilities/mock-interview'
import type {
  CareerFlowState,
  CareerIntent,
  CareerThreadState,
} from '../../shared'
import { CAREER_MAIN_AGENT_PROMPT } from './prompt'

function getActiveFlow(threadState: CareerThreadState) {
  return threadState.activeFlowId
    ? threadState.flows[threadState.activeFlowId]
    : undefined
}

function getRecentFlows(threadState: CareerThreadState) {
  return threadState.recentFlowIds
    .map((flowId) => threadState.flows[flowId])
    .filter((flow): flow is CareerFlowState => Boolean(flow))
}

function buildCapabilityCatalogPrompt() {
  return [
    '可用能力卡：',
    ...getTaskCapabilityConfigs().map((config) =>
      [
        `- ${config.label}（${config.intent}）`,
        `  - 说明：${config.description}`,
        `  - 适用场景：${config.entryGuidance}`,
        `  - 切换启动：${config.handoffGuidance}`,
      ].join('\n')
    ),
  ].join('\n')
}

function buildActiveFlowPrompt(flow: CareerFlowState) {
  const config = CAREER_CAPABILITY_CONFIGS[flow.intent]
  const flowSpecificStatePrompt =
    flow.intent === 'mock_interview'
      ? buildMockInterviewStateSummary(flow.slots)
      : null

  return [
    '当前 active flow：',
    JSON.stringify(
      {
        id: flow.id,
        intent: flow.intent,
        label: config.label,
        phase: flow.phase,
        summary: flow.summary,
        lastAssistantAction: flow.lastAssistantAction ?? null,
        lastAssistantOffer: flow.lastAssistantOffer ?? null,
        lastUserAction: flow.lastUserAction ?? null,
        pendingDecision: flow.pendingDecision ?? null,
        slots: flow.slots,
        status: flow.status,
      },
      null,
      2
    ),
    '当前 active flow 的专属指导：',
    config.prompt,
    flowSpecificStatePrompt,
  ].join('\n\n')
}

function buildPreselectedCapabilityPrompt(
  intent: Exclude<CareerIntent, 'general'> | null | undefined
) {
  if (!intent) {
    return null
  }

  const config = CAREER_CAPABILITY_CONFIGS[intent]

  return [
    '首轮 capability 预选结果：',
    JSON.stringify(
      {
        description: config.description,
        intent: config.intent,
        label: config.label,
      },
      null,
      2
    ),
    '当前应优先参考的能力卡专属指导：',
    config.prompt,
  ].join('\n\n')
}

function buildThreadStatePrompt(input: {
  preselectedIntent?: Exclude<CareerIntent, 'general'> | null
  threadState: CareerThreadState
  userInput: string
}) {
  const activeFlow = getActiveFlow(input.threadState)
  const recentFlows = getRecentFlows(input.threadState)
    .filter((flow) => flow.id !== activeFlow?.id)
    .slice(0, 6)
    .map((flow) => ({
      id: flow.id,
      intent: flow.intent,
      phase: flow.phase,
      summary: flow.summary,
      status: flow.status,
    }))

  return [
    '当前线程状态摘要：',
    JSON.stringify(
      {
        activeFlowId: input.threadState.activeFlowId,
        artifacts: input.threadState.artifacts.slice(-8),
        preselectedIntent: input.preselectedIntent ?? null,
        recentFlows,
        userInput: input.userInput,
      },
      null,
      2
    ),
    !activeFlow
      ? buildPreselectedCapabilityPrompt(input.preselectedIntent)
      : null,
    activeFlow ? buildActiveFlowPrompt(activeFlow) : '当前没有 active flow。',
    buildCapabilityCatalogPrompt(),
  ]
    .filter((section): section is string => Boolean(section))
    .join('\n\n')
}

export function buildCareerMainAgentInstructions(input: {
  preselectedIntent?: Exclude<CareerIntent, 'general'> | null
  threadState: CareerThreadState
  userInput: string
}) {
  return [CAREER_MAIN_AGENT_PROMPT, buildThreadStatePrompt(input)]
}
