import { selectCareerCapability } from '../agents/capability-selector'
import { buildCareerMainAgentInstructions } from '../agents/main-agent'
import { extractCareerStateAfterReply } from '../agents/state-extractor'
import type { CareerMessage, CareerStateCommit } from '../shared'
import { loadCareerThreadState, resetCareerThreadState } from '../state'

export interface BuildCareerWorkflowContextInput {
  actorId: string
  chatSessionId: string
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  resetThreadState?: boolean
  userInput: string
}

export interface CareerWorkflowContextResult {
  additionalInstructions: string[]
  directAnswer?: string
  resolveStateCommitAfterReply?: (
    assistantReply: string
  ) => Promise<CareerStateCommit | undefined>
}

function buildCareerMessages(input: {
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  userInput: string
}): CareerMessage[] {
  const messages = input.conversation.map((message) => ({
    content: message.content,
    role: message.role,
  }))
  const lastMessage = messages.at(-1)

  if (
    lastMessage?.role === 'user' &&
    lastMessage.content.trim() === input.userInput.trim()
  ) {
    return messages
  }

  return [
    ...messages,
    {
      content: input.userInput,
      role: 'user' as const,
    },
  ]
}

export async function buildCareerWorkflowContext(
  input: BuildCareerWorkflowContextInput
): Promise<CareerWorkflowContextResult> {
  void input.actorId

  if (input.resetThreadState) {
    await resetCareerThreadState(input.chatSessionId)
  }

  const messages = buildCareerMessages({
    conversation: input.conversation,
    userInput: input.userInput,
  })
  const threadState = await loadCareerThreadState(input.chatSessionId)
  const capabilitySelection =
    threadState.activeFlowId === null
      ? await selectCareerCapability({
          messages,
          userInput: input.userInput,
        })
      : null
  const additionalInstructions = buildCareerMainAgentInstructions({
    preselectedIntent: capabilitySelection?.intent ?? null,
    threadState,
    userInput: input.userInput,
  })

  return {
    additionalInstructions,
    directAnswer: undefined,
    resolveStateCommitAfterReply: (assistantReply: string) =>
      extractCareerStateAfterReply({
        assistantReply,
        chatSessionId: input.chatSessionId,
        messages,
        previousState: threadState,
        userInput: input.userInput,
      }),
  }
}
