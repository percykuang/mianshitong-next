import { type ChatModelId, type ChatUsageSummary } from './types'

export const mockChatUsageByModel: Record<ChatModelId, ChatUsageSummary> = {
  balanced: { used: 12, max: 50 },
  reasoning: { used: 6, max: 20 },
}

export const quickPrompts = [
  '可以帮我优化简历吗？',
  '开始模拟面试，我是前端工程师 React 技术栈',
  '前端面试时，如何正确的自我介绍',
  '我是前端工程师，如何挖掘简历项目亮点',
] as const
