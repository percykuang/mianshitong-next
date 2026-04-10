import {
  createChatSessionTitle,
  formatChatTimestamp,
  type ChatSessionPreview,
  type ConversationMessage,
} from '@/components'

interface CreateNextSessionOptions {
  input: string
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
}

function createUserMessage(input: string): ConversationMessage {
  return {
    id: `user-${Date.now()}`,
    role: 'user',
    label: '你',
    timestamp: formatChatTimestamp(),
    content: input,
  }
}

// 按置顶时间和创建时间统一排序会话列表。
export function sortSessions(sessions: ChatSessionPreview[]) {
  return [...sessions].sort((left, right) => {
    const leftPinned = Boolean(left.pinned)
    const rightPinned = Boolean(right.pinned)

    if (leftPinned !== rightPinned) {
      return leftPinned ? -1 : 1
    }

    if (leftPinned && rightPinned) {
      return (right.pinnedAt ?? 0) - (left.pinnedAt ?? 0)
    }

    return right.createdAt - left.createdAt
  })
}

// 基于当前输入和已选会话构造下一次对话所使用的会话快照。
export function createNextSession({
  input,
  selectedSessionId,
  sessions,
}: CreateNextSessionOptions): ChatSessionPreview {
  const now = Date.now()
  const nextSessionId = selectedSessionId ?? `session-${now}`
  const baseSession =
    sessions.find((session) => session.id === nextSessionId) ?? null
  const userMessage = createUserMessage(input)

  return {
    createdAt: baseSession?.createdAt ?? now,
    id: nextSessionId,
    pinnedAt: baseSession?.pinnedAt,
    title: baseSession?.title ?? createChatSessionTitle(input),
    preview: input,
    pinned: baseSession?.pinned,
    messages: [...(baseSession?.messages ?? []), userMessage],
  }
}
