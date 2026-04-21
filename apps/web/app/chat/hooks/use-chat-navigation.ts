'use client'

import { useRef } from 'react'

import { buildChatPath, getRouteSessionIdFromPathname } from '../utils'

export type ChatHistoryMode = 'push' | 'replace'

export function useChatNavigation(pathname: string) {
  // 把当前 URL 解析成路由层正在指向的会话 ID，供 controller 判断
  // “当前地址栏对应的是新对话，还是某个具体会话”。
  const routeSessionId = getRouteSessionIdFromPathname(pathname)
  // 某些交互会先更新 store，再在下一拍统一同步 URL。
  // 这里用 ref 暂存“这次 URL 同步应该走 push 还是 replace”。
  const requestedHistoryModeRef = useRef<ChatHistoryMode | null>(null)

  const updateHistory = (sessionId: string | null, mode: ChatHistoryMode) => {
    // 统一把“目标会话 ID”转换成 chat 路径，避免各处手写 `/chat` / `/chat/:id`。
    const targetPath = buildChatPath(sessionId)

    // 如果地址栏已经是目标路径，就不重复写 history，避免制造无意义的状态变更。
    if (window.location.pathname === targetPath) {
      return
    }

    // 用户主动切换会话时使用 push，让浏览器后退能回到上一条聊天路径；
    // 自动把新对话同步成 `/chat/:sessionId` 时使用 replace，避免污染历史栈。
    if (mode === 'push') {
      window.history.pushState(null, '', targetPath)
      return
    }

    window.history.replaceState(null, '', targetPath)
  }

  return {
    // 读取并清空上一次交互留下的 history 同步方式。
    // 例如：点击侧边栏切换会话时，后续 URL 应该使用 pushState。
    takeRequestedHistoryMode() {
      const nextMode = requestedHistoryModeRef.current
      requestedHistoryModeRef.current = null
      return nextMode
    },
    // 标记“下一次 URL 同步应写入浏览器历史栈”，用于用户主动导航场景。
    requestPushNavigation() {
      requestedHistoryModeRef.current = 'push'
    },
    // 按指定方式真正更新地址栏。
    applyHistory(sessionId: string | null, mode: ChatHistoryMode) {
      updateHistory(sessionId, mode)
    },
    routeSessionId,
  }
}
