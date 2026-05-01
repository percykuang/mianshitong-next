import type { Prisma } from '@prisma/client'

const CHAT_MODEL_STABLE_ORDER_BY = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' },
] satisfies Prisma.ChatModelConfigOrderByWithRelationInput[]

export const STORED_CHAT_MODEL_ORDER_BY = CHAT_MODEL_STABLE_ORDER_BY

export const ENABLED_RUNTIME_CHAT_MODEL_ORDER_BY = [
  { isDefault: 'desc' },
  ...CHAT_MODEL_STABLE_ORDER_BY,
] satisfies Prisma.ChatModelConfigOrderByWithRelationInput[]

export const DEFAULT_ENABLED_MODEL_FALLBACK_ORDER_BY =
  CHAT_MODEL_STABLE_ORDER_BY
