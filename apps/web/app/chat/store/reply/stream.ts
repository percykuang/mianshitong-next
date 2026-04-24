'use client'

import {
  buildOptimisticEditedSession,
  buildPersistedReplySessionState,
  clearPendingReplySidebarSession,
  createNextSession,
  deletePersistedChatSession,
  getPersistedChatSession,
  streamChatReply,
  streamEditedChatReply,
} from '../../utils'
import { getSessionById, replaceSession, upsertSession } from '../core/helpers'
import { isReplying } from '../core/selectors'
import { type ChatStoreGetState, type ChatStoreSetState } from '../core/types'
import { type ChatReplyLifecycle } from './lifecycle'

interface CreateChatReplyStreamActionsInput {
  get: ChatStoreGetState
  lifecycle: ChatReplyLifecycle
  set: ChatStoreSetState
  setActiveAbortController: (controller: AbortController | null) => void
}

export function createChatReplyStreamActions({
  get,
  lifecycle,
  set,
  setActiveAbortController,
}: CreateChatReplyStreamActionsInput) {
  const getMatchingActiveReply = (assistantMessageId: string) => {
    const activeReply = get().activeReply

    return activeReply?.assistantMessageId === assistantMessageId
      ? activeReply
      : null
  }

  const finalizeCompletedReply = async (input: {
    assistantMessageId: string
    fallbackSessionId: string
    persistedSessionId: string | null | undefined
    persistenceEnabled: boolean
  }) => {
    const completedReply = getMatchingActiveReply(input.assistantMessageId)

    if (completedReply) {
      lifecycle.finalizeCompletedReply({
        activeReply: completedReply,
        assistantMessageId: input.assistantMessageId,
      })
    }

    if (input.persistenceEnabled) {
      await lifecycle.hydrateSession(
        input.persistedSessionId ?? input.fallbackSessionId,
        input.fallbackSessionId
      )
    }
  }

  async function sendMessage(inputOverride?: string) {
    const initialState = get()
    // 支持“直接传入内容发送”和“发送当前草稿”两种入口。
    const input = (inputOverride ?? initialState.draft).trim()

    // 空消息不发送；同一时间只允许存在一条进行中的回复。
    if (!input || isReplying(initialState.activeReply)) {
      return
    }

    // 先在前端构造一份 optimistic session，这样用户消息可以立刻出现在界面上，
    // 不必等待服务端真正创建 / 更新会话后再渲染。
    const optimisticSession = createNextSession({
      input,
      selectedSessionId: initialState.selectedSessionId,
      sessions: initialState.sessions,
    })
    const activeSessionId = optimisticSession.id
    const assistantMessageId = `assistant-${Date.now()}`
    const isNewSession = initialState.selectedSessionId === null
    const shouldHideSessionFromSidebar =
      initialState.persistenceEnabled && isNewSession

    // 进入“等待首个 chunk”状态，并把 optimistic session 写入 store。
    // 这里同时清空草稿，让输入框立即回到可输入状态。
    set((state) => ({
      activeReply: {
        assistantMessageId,
        latestContent: '',
        mode: 'new',
        optimisticSessionId: isNewSession ? activeSessionId : null,
        sessionId: activeSessionId,
        status: 'awaiting-first-chunk',
      },
      draft: '',
      pendingSidebarSessionId: shouldHideSessionFromSidebar
        ? activeSessionId
        : state.pendingSidebarSessionId,
      selectedSessionId: activeSessionId,
      sessions: upsertSession(
        state.sessions,
        activeSessionId,
        optimisticSession
      ),
    }))

    // 用 AbortController 承接“停止生成”操作。
    const controller = new AbortController()
    setActiveAbortController(controller)

    try {
      const { content, sessionId: persistedSessionId } = await streamChatReply({
        // 非持久化入口需要把完整 history 带给服务端；持久化入口则只需发送当前消息，
        // 服务端会自行从数据库加载完整会话。
        history: optimisticSession.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        message: input,
        modelId: initialState.selectedModelId,
        sessionId: initialState.persistenceEnabled
          ? activeSessionId
          : undefined,
        signal: controller.signal,
        onChunk(nextContent) {
          // 前端按“累计后的完整文本”持续覆盖当前回复内容，驱动流式渲染。
          lifecycle.syncReplyChunk(assistantMessageId, nextContent)
        },
      })

      // 流结束后，把最终文本和本次调用的运行时信息同步进 store。
      lifecycle.syncReplyResult({
        assistantMessageId,
        content,
      })

      // 把 optimistic assistant 回复提交为完成态；如果开启持久化，再用服务端真实会话回填。
      await finalizeCompletedReply({
        assistantMessageId,
        fallbackSessionId: activeSessionId,
        persistedSessionId,
        persistenceEnabled: initialState.persistenceEnabled,
      })
    } catch (error) {
      const activeReply = getMatchingActiveReply(assistantMessageId)

      if (activeReply) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // 用户主动停止时，尽量把已经生成出来的部分按“中断回复”落下来。
          await lifecycle.finalizeInterruptedReply({
            activeReply,
            assistantMessageId,
          })
        } else if (initialState.persistenceEnabled && isNewSession) {
          // 新会话首次发送时如果中途失败，要额外判断服务端是否已经部分落库：
          // 落了就优先回填真实会话，没落则回滚这次 optimistic 新会话。
          const persistedSession = await getPersistedChatSession(
            activeReply.sessionId
          ).catch(() => null)

          if (persistedSession && persistedSession.messages.length > 0) {
            set((state) => ({
              activeReply:
                state.activeReply?.assistantMessageId === assistantMessageId
                  ? null
                  : state.activeReply,
              ...buildPersistedReplySessionState({
                optimisticSessionId:
                  activeReply.optimisticSessionId ?? persistedSession.id,
                pendingSidebarSessionId: state.pendingSidebarSessionId,
                persistedSession,
                sessions: state.sessions,
              }),
            }))
          } else {
            if (initialState.persistenceEnabled) {
              await deletePersistedChatSession(activeSessionId).catch(
                () => null
              )
            }

            // 服务端没有留下可恢复的数据，就撤销这次新建会话，并把输入还回草稿。
            set((state) => ({
              activeReply:
                state.activeReply?.assistantMessageId === assistantMessageId
                  ? null
                  : state.activeReply,
              draft: state.draft || input,
              pendingSidebarSessionId: clearPendingReplySidebarSession({
                pendingSidebarSessionId: state.pendingSidebarSessionId,
                sessionId: activeSessionId,
              }),
              selectedSessionId: initialState.selectedSessionId,
              sessions: state.sessions.filter(
                (session) => session.id !== activeSessionId
              ),
            }))
          }
        } else {
          // 其他失败场景交给统一失败收口逻辑处理。
          await lifecycle.finalizeFailedReply({
            activeReply,
            assistantMessageId,
            error,
          })
        }
      }
    } finally {
      // 无论成功、失败还是中断，都要释放 controller，并清掉当前 activeReply 标记。
      setActiveAbortController(null)
      lifecycle.clearActiveReply(assistantMessageId)
    }
  }

  async function submitEditedMessage() {
    const state = get()
    const selectedSession = getSessionById(
      state.sessions,
      state.selectedSessionId
    )
    const nextContent = state.editingValue.trim()
    const editingMessageId = state.editingMessageId

    if (
      isReplying(state.activeReply) ||
      !selectedSession ||
      !editingMessageId ||
      !nextContent
    ) {
      return false
    }

    const assistantMessageId = `assistant-edit-${Date.now()}`
    const optimisticSession = buildOptimisticEditedSession({
      content: nextContent,
      messageId: editingMessageId,
      session: selectedSession,
    })

    if (!optimisticSession) {
      return false
    }

    set((currentState) => ({
      activeReply: {
        assistantMessageId,
        latestContent: '',
        mode: 'edit',
        optimisticSessionId: selectedSession.id,
        sessionId: selectedSession.id,
        status: 'awaiting-first-chunk',
      },
      editingMessageId: null,
      editingValue: '',
      pendingEditedMessageAnchorId: editingMessageId,
      sessions: replaceSession(
        currentState.sessions,
        optimisticSession.id,
        optimisticSession
      ),
    }))

    const controller = new AbortController()
    setActiveAbortController(controller)

    try {
      const { content, sessionId: persistedSessionId } =
        await streamEditedChatReply({
          content: nextContent,
          messageId: editingMessageId,
          onChunk(nextChunkContent) {
            lifecycle.syncReplyChunk(assistantMessageId, nextChunkContent)
          },
          sessionId: selectedSession.id,
          signal: controller.signal,
        })

      lifecycle.syncReplyResult({
        assistantMessageId,
        content,
      })

      await finalizeCompletedReply({
        assistantMessageId,
        fallbackSessionId: selectedSession.id,
        persistedSessionId,
        persistenceEnabled: state.persistenceEnabled,
      })

      return true
    } catch (error) {
      const activeReply = getMatchingActiveReply(assistantMessageId)

      if (activeReply) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          await lifecycle.finalizeInterruptedReply({
            activeReply,
            assistantMessageId,
          })
        } else {
          await lifecycle.finalizeFailedReply({
            activeReply,
            assistantMessageId,
            error,
          })
        }
      }

      return false
    } finally {
      setActiveAbortController(null)
      lifecycle.clearActiveReply(assistantMessageId)
    }
  }

  return {
    sendMessage,
    submitEditedMessage,
  }
}
