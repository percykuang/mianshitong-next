'use client'

import { useEffect, useEffectEvent, useRef } from 'react'

import { type ChatSessionPreview } from '@/app/chat/domain'

import { buildChatPath } from '../../utils'

/**
 * 根据当前 pathname 反向同步 chat store 的选中会话。
 *
 * 主要用于这些场景：
 * - 首次进入聊天页
 * - 手动刷新页面
 * - 浏览器前进 / 后退导致的路由变化
 *
 * 设计上只在首次挂载或 pathname 真正变化时执行，
 * 避免和“store -> URL”的同步逻辑互相覆盖。
 */
export function useChatSessionSelectionRouteSyncEffect(input: {
  isReplying: boolean
  pathname: string
  routeSessionId: string | null
  selectedSessionId: string | null
  sessions: ChatSessionPreview[]
  onSelectRouteNewSession: () => void
  onSelectRouteSession: (sessionId: string) => void
}) {
  const {
    isReplying,
    onSelectRouteNewSession,
    onSelectRouteSession,
    pathname,
    routeSessionId,
    selectedSessionId,
    sessions,
  } = input
  const previousPathnameRef = useRef<string | null>(null)

  // 给 effect 一个“稳定的调用入口”：
  // effect 只需要关心 pathname / routeSessionId 这些真正的同步条件，
  // 这里内部再去读取最新的 onSelectRouteNewSession，避免因为回调引用变化而让 effect 反复重跑。
  const handleSelectRouteNewSession = useEffectEvent(() => {
    onSelectRouteNewSession()
  })

  // 这个作用和上面一样，只是把“切到某个具体会话”的最新回调包成 effect event。
  const handleSelectRouteSession = useEffectEvent((sessionId: string) => {
    onSelectRouteSession(sessionId)
  })

  useEffect(() => {
    // 这层 effect 只负责“路由 -> store”的同步。
    // 也就是说：当用户首次进入页面、刷新页面、或通过浏览器前进后退导致 pathname 改变时，
    // 根据当前地址栏决定 store 里应该选中哪个会话。
    const isInitialPathSync = previousPathnameRef.current === null
    const pathChanged = previousPathnameRef.current !== pathname
    previousPathnameRef.current = pathname

    // 如果既不是首次同步，也不是 pathname 真正变化，就不要因为普通状态更新反向改 store，
    // 否则很容易和“store -> URL”的同步逻辑互相打架。
    if (!isInitialPathSync && !pathChanged) {
      return
    }

    // 路由和 store 已经一致时，无需再做任何同步。
    if (routeSessionId === selectedSessionId) {
      return
    }

    if (routeSessionId === null) {
      // 地址栏回到 `/chat` 时，切回“新对话”状态；
      // 但如果当前正在生成回复，先跳过，避免在流式过程中打断当前会话。
      if (isReplying) {
        return
      }

      handleSelectRouteNewSession()
      return
    }

    // 地址栏指向了一个本地不存在或没有消息的会话时，先回退到新对话状态，
    // 避免 store 进入一个无效的 selectedSessionId。
    if (
      !sessions.some(
        (session) =>
          session.id === routeSessionId && session.messages.length > 0
      )
    ) {
      handleSelectRouteNewSession()
      return
    }

    // 其余情况说明 pathname 指向了一个有效会话，按路由结果更新 store。
    handleSelectRouteSession(routeSessionId)
  }, [isReplying, pathname, routeSessionId, selectedSessionId, sessions])
}

/**
 * 根据 chat store 当前选中的会话，同步地址栏路径。
 *
 * 主要用于这些场景：
 * - 用户主动点击侧边栏切换会话 / 新建会话
 * - 新对话发送第一条消息后，把 `/chat` 规范化为 `/chat/:sessionId`
 *
 * 这层只在 selectedSessionId 真正变化时尝试更新 history，
 * 并优先消费上层显式声明的 push / replace 导航意图。
 */
export function useChatPathSyncEffect(input: {
  selectedSessionId: string | null
  takeRequestedHistoryMode: () => 'push' | 'replace' | null
  applyHistory: (sessionId: string | null, mode: 'push' | 'replace') => void
}) {
  const { applyHistory, selectedSessionId, takeRequestedHistoryMode } = input
  const previousSelectedSessionIdRef = useRef<string | null>(selectedSessionId)
  const handleApplyHistory = useEffectEvent(
    (sessionId: string | null, mode: 'push' | 'replace') => {
      applyHistory(sessionId, mode)
    }
  )

  useEffect(() => {
    // 这层 effect 负责“store -> 路由”的同步。
    // 当 selectedSessionId 真正变化后，才决定地址栏是否需要跟着变化。
    const previousSelectedSessionId = previousSelectedSessionIdRef.current
    previousSelectedSessionIdRef.current = selectedSessionId

    // 不是会话切换导致的更新，直接跳过，避免每次重渲染都尝试改 URL。
    if (previousSelectedSessionId === selectedSessionId) {
      return
    }

    const targetPath = buildChatPath(selectedSessionId)

    // 如果地址栏本来就已经是目标路径，就不重复写 history；
    // 同时把上一次遗留的导航意图消费掉，避免污染下一次同步。
    if (targetPath === window.location.pathname) {
      takeRequestedHistoryMode()
      return
    }

    // 用户主动点击侧边栏切换会话 / 新建会话时，会预先声明这次应使用 push；
    // 这里优先消费这类“显式导航意图”。
    const requestedHistoryMode = takeRequestedHistoryMode()

    if (requestedHistoryMode) {
      handleApplyHistory(selectedSessionId, requestedHistoryMode)
      return
    }

    // 从新对话发送第一条消息后，selectedSessionId 会从 null 变成真实 sessionId。
    // 这种“系统自动把 `/chat` 规范化成 `/chat/:sessionId`”的场景使用 replace，
    // 避免给浏览器历史栈平白多塞一条记录。
    if (previousSelectedSessionId === null && selectedSessionId) {
      handleApplyHistory(selectedSessionId, 'replace')
      return
    }

    // 其余退回到新对话页的系统性同步，同样使用 replace。
    if (selectedSessionId === null) {
      handleApplyHistory(null, 'replace')
    }
  }, [selectedSessionId, takeRequestedHistoryMode])
}
