import { ChatOpenAI } from '@langchain/openai'
import 'server-only'

import { getOrCreateJsonModelClient, getOrCreateModelClient } from './cache'
import { resolveChatModelPlan } from './plan'

export type ChatModelClient = ChatOpenAI

/**
 * 按业务层使用的聊天模型 ID 获取模型客户端。
 * 当前项目使用同一模型同时负责普通聊天与结构化输出。
 */
export async function getChatModel(modelId?: string) {
  const resolvedPlan = await resolveChatModelPlan(modelId)

  return getOrCreateModelClient({
    connection: resolvedPlan.connection,
    provider: resolvedPlan.provider,
  })
}

export async function getJsonChatModel(modelId?: string) {
  const plan = await resolveChatModelPlan(modelId)

  if (!plan.supportsJsonOutput) {
    return getOrCreateModelClient({
      connection: plan.connection,
      provider: plan.provider,
    })
  }

  return getOrCreateJsonModelClient({
    connection: plan.connection,
    provider: plan.provider,
  })
}
