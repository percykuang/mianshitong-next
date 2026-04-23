import type {
  CareerFlowState,
  CareerMessage,
  CareerThreadState,
} from '../../shared'

export function getActiveFlow(state: CareerThreadState) {
  return state.activeFlowId ? state.flows[state.activeFlowId] : undefined
}

export function buildStateExtractorPayload(input: {
  assistantReply: string
  messages: CareerMessage[]
  previousState: CareerThreadState
  userInput: string
}) {
  return {
    activeFlow: getActiveFlow(input.previousState) ?? null,
    assistantReply: input.assistantReply,
    recentFlows: input.previousState.recentFlowIds
      .map((flowId) => input.previousState.flows[flowId])
      .filter((flow): flow is CareerFlowState => Boolean(flow))
      .slice(0, 6)
      .map((flow) => ({
        id: flow.id,
        intent: flow.intent,
        phase: flow.phase,
        summary: flow.summary,
        status: flow.status,
      })),
    recentMessages: input.messages.slice(-10),
    userInput: input.userInput,
  }
}
