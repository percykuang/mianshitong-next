import { getChatModel, normalizeModelChunkText } from '@mianshitong/llm'
import { createLogger } from '@mianshitong/shared/runtime'

import {
  CAREER_CHAT_POLICY_INSTRUCTION,
  type CareerWorkflowContextResult,
  commitCareerThreadState,
} from '@/server/career'
import { persistAssistantReply } from '@/server/chat'

const logger = createLogger('web.api.chat.stream')

function closeReadableStreamController(
  controller: ReadableStreamDefaultController
) {
  try {
    controller.close()
  } catch (error) {
    if (
      !(error instanceof TypeError) ||
      !error.message.includes('Controller is already closed')
    ) {
      throw error
    }
  }
}

export function createChatStreamHeaders(input: { persistedSessionId: string }) {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'x-mst-chat-session-id': input.persistedSessionId,
  }
}

export function createChatResponseStream(input: {
  actorId: string
  conversation: Array<{ content: string; role: 'assistant' | 'user' }>
  model: ReturnType<typeof getChatModel>
  persistedSessionId: string
  requestSignal: AbortSignal
  resolveWorkflowContext?: () => Promise<
    Pick<
      CareerWorkflowContextResult,
      'additionalInstructions' | 'directAnswer' | 'resolveStateCommitAfterReply'
    >
  >
}) {
  const encoder = new TextEncoder()

  const resolveAndCommitStateAfterReply = async (payload: {
    assistantReply: string
    resolveStateCommitAfterReply:
      | CareerWorkflowContextResult['resolveStateCommitAfterReply']
      | undefined
  }) => {
    if (!payload.resolveStateCommitAfterReply) {
      return
    }

    const stateCommit = await payload.resolveStateCommitAfterReply(
      payload.assistantReply
    )

    if (!stateCommit) {
      return
    }

    await commitCareerThreadState(stateCommit)
  }

  return new ReadableStream({
    async start(controller) {
      let controllerClosed = false

      const closeController = () => {
        if (controllerClosed) {
          return
        }

        closeReadableStreamController(controller)
        controllerClosed = true
      }

      try {
        const workflow = input.resolveWorkflowContext
          ? await input.resolveWorkflowContext()
          : {
              additionalInstructions: [],
              directAnswer: undefined,
              resolveStateCommitAfterReply: undefined,
            }

        if (workflow.directAnswer) {
          if (input.requestSignal.aborted) {
            return
          }

          controller.enqueue(encoder.encode(workflow.directAnswer))
          await persistAssistantReply({
            actorId: input.actorId,
            completionStatus: 'completed',
            content: workflow.directAnswer,
            sessionId: input.persistedSessionId,
          })
          closeController()
          await resolveAndCommitStateAfterReply({
            assistantReply: workflow.directAnswer,
            resolveStateCommitAfterReply: workflow.resolveStateCommitAfterReply,
          })
          return
        }

        let assistantContent = ''
        const systemInstructions = [
          CAREER_CHAT_POLICY_INSTRUCTION,
          ...(workflow.additionalInstructions ?? []),
        ].filter((instruction) => instruction.trim().length > 0)
        const outputStream = await input.model.stream([
          ...systemInstructions.map((instruction) => ({
            role: 'system' as const,
            content: instruction,
          })),
          ...input.conversation,
        ])

        for await (const chunk of outputStream) {
          if (input.requestSignal.aborted) {
            return
          }

          const text = normalizeModelChunkText(chunk)

          if (!text) {
            continue
          }

          assistantContent += text
          controller.enqueue(encoder.encode(text))
        }

        await persistAssistantReply({
          actorId: input.actorId,
          completionStatus: 'completed',
          content: assistantContent,
          sessionId: input.persistedSessionId,
        })
        closeController()
        await resolveAndCommitStateAfterReply({
          assistantReply: assistantContent,
          resolveStateCommitAfterReply: workflow.resolveStateCommitAfterReply,
        })
      } catch (error) {
        if (input.requestSignal.aborted) {
          return
        }

        logger.error('model stream failed', error)
        if (!controllerClosed) {
          controller.error(error)
        }
      }
    },
  })
}
