export function formatChatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function createChatSessionTitle(input: string) {
  return input.trim().slice(0, 18) || '新的面试对话'
}
