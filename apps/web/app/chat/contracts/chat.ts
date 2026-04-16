import {
  getDefaultChatModelId,
  isChatModelId,
  normalizeChatModelId,
} from '@mianshitong/providers/model/catalog'
import type { ChatModelId } from '@mianshitong/providers/model/types'
import { z } from 'zod'

function getOptionalTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : undefined
}

function getOptionalBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function getOptionalMessageCount(value: unknown) {
  return typeof value === 'number' ? value : Number.NaN
}

function getOptionalChatHistory(value: unknown) {
  return Array.isArray(value) ? value : undefined
}

function createRequiredTrimmedStringSchema(message: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string().trim().min(1, message)
  )
}

function createNormalizedOptionalModelIdSchema() {
  return z
    .preprocess(getOptionalTrimmedString, z.string().optional())
    .transform((value) =>
      value && value.length > 0 ? value : getDefaultChatModelId()
    )
    .refine(isChatModelId, {
      message: '不支持的模型类型',
    })
    .transform((value) => normalizeChatModelId(value))
}

const optionalSessionIdSchema = z
  .preprocess(getOptionalTrimmedString, z.string().optional())
  .transform((value) => (value && value.length > 0 ? value : null))

const optionalTitleSchema = z.preprocess(
  getOptionalTrimmedString,
  z.string().optional()
)

export const chatRequestMessageSchema = z.object({
  role: z.enum(['assistant', 'user']),
  content: z.string(),
})

export const chatRequestBodySchema = z
  .object({
    history: z.preprocess(
      getOptionalChatHistory,
      z.array(chatRequestMessageSchema).optional()
    ),
    message: createRequiredTrimmedStringSchema('消息内容不能为空'),
    modelId: createNormalizedOptionalModelIdSchema(),
    sessionId: optionalSessionIdSchema,
  })
  .transform(({ message, modelId, sessionId }) => ({
    message,
    normalizedModelId: modelId,
    normalizedSessionId: sessionId,
  }))

export const createSessionBodySchema = z
  .object({
    modelId: createNormalizedOptionalModelIdSchema(),
    title: optionalTitleSchema,
  })
  .transform(({ modelId, title }) => ({
    modelId,
    ...(typeof title === 'string' ? { title } : {}),
  }))

export const updateSessionBodySchema = z
  .object({
    pinned: z.preprocess(getOptionalBoolean, z.boolean().optional()),
    title: optionalTitleSchema,
  })
  .superRefine((value, context) => {
    if (typeof value.pinned !== 'boolean' && typeof value.title !== 'string') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: '至少需要提供一个可更新字段',
      })
    }

    if (typeof value.title === 'string' && value.title.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: '会话标题不能为空',
        path: ['title'],
      })
    }
  })
  .transform(({ pinned, title }) => ({
    ...(typeof pinned === 'boolean' ? { pinned } : {}),
    ...(typeof title === 'string' ? { title } : {}),
  }))

export const updateMessageFeedbackBodySchema = z.object({
  feedback: z.union([z.literal('like'), z.literal('dislike'), z.null()]),
})

export const editMessageBodySchema = z
  .object({
    content: createRequiredTrimmedStringSchema('消息内容不能为空'),
  })
  .transform(({ content }) => content)

export const interruptMessageBodySchema = z
  .object({
    content: createRequiredTrimmedStringSchema('中断消息内容不能为空'),
    expectedMessageCount: z
      .preprocess(getOptionalMessageCount, z.number())
      .transform((value) => Math.floor(value))
      .pipe(z.number().int().min(0, 'expectedMessageCount 非法')),
  })
  .transform(({ content, expectedMessageCount }) => ({
    content,
    expectedMessageCount,
  }))

export const streamMessageBodySchema = z
  .object({
    content: createRequiredTrimmedStringSchema('消息内容不能为空'),
    modelId: createNormalizedOptionalModelIdSchema(),
  })
  .transform(({ content, modelId }) => ({
    content,
    normalizedModelId: modelId,
  }))

export type ChatRequestMessage = z.infer<typeof chatRequestMessageSchema>
export type ChatRequestBody = z.input<typeof chatRequestBodySchema>
export type ParsedChatRequest = z.output<typeof chatRequestBodySchema>
export type CreateSessionBody = z.input<typeof createSessionBodySchema>
export type ParsedCreateSessionBody = z.output<typeof createSessionBodySchema>
export type UpdateSessionBody = z.input<typeof updateSessionBodySchema>
export type ParsedUpdateSessionBody = z.output<typeof updateSessionBodySchema>
export type UpdateMessageFeedbackBody = z.input<
  typeof updateMessageFeedbackBodySchema
>
export type ParsedUpdateMessageFeedbackBody = z.output<
  typeof updateMessageFeedbackBodySchema
>['feedback']
export type EditMessageBody = z.input<typeof editMessageBodySchema>
export type ParsedEditMessageBody = z.output<typeof editMessageBodySchema>
export type InterruptMessageBody = z.input<typeof interruptMessageBodySchema>
export type ParsedInterruptMessageBody = z.output<
  typeof interruptMessageBodySchema
>
export type StreamMessageBody = z.input<typeof streamMessageBodySchema>
export type ParsedStreamMessageBody = z.output<typeof streamMessageBodySchema>
export type ChatContractModelId = ChatModelId
