import {
  type ChatSessionPreview,
  type ConversationMessage,
  createChatSessionTitle,
  formatChatTimestamp,
} from '@/app/chat/domain'

interface CreateNextSessionOptions {
  input: string
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
}

const CHAT_SESSION_ID_FALLBACK_RANDOM_LENGTH = 20

function createRandomIdSegment(length: number) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length)
    .padEnd(length, '0')
}

export function createChatSessionId() {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID().replace(/-/g, '')
  }

  return `${Date.now().toString(36)}-${createRandomIdSegment(
    CHAT_SESSION_ID_FALLBACK_RANDOM_LENGTH
  )}`
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

// 按置顶时间和最近更新时间统一排序会话列表，保持与服务端列表一致。
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

    return right.updatedAt - left.updatedAt
  })
}

// 基于当前输入和已选会话构造下一次对话所使用的会话快照。
export function createNextSession({
  input,
  selectedSessionId,
  sessions,
}: CreateNextSessionOptions): ChatSessionPreview {
  const now = Date.now()
  const nextSessionId = selectedSessionId ?? createChatSessionId()
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
    updatedAt: now,
    messages: [...(baseSession?.messages ?? []), userMessage],
  }
}
