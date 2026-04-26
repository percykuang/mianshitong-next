export function formatChatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export const DEFAULT_CHAT_SESSION_TITLE = '新会话'

export function createChatSessionTitle() {
  return DEFAULT_CHAT_SESSION_TITLE
}
