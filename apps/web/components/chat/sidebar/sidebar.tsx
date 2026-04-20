'use client'

import { useScrollRestoration } from '@mianshitong/hooks'
import { AppBrand, ChevronLeft, Plus, Tooltip, Trash } from '@mianshitong/ui'

import { AuthEntry } from '../../auth'
import { type ChatSessionPreview } from '../types'
import { ChatSidebarSessionItem } from './session-item'

export function ChatSidebar({
  onCloseSidebar,
  onDeleteAllSessions,
  onDeleteSession,
  onNewSession,
  onRenameSession,
  onSelectSession,
  onTogglePinSession,
  sessions,
  selectedSessionId,
  sidebarOpen,
  userEmail,
}: {
  onCloseSidebar: () => void
  onDeleteAllSessions: () => void
  onDeleteSession: (sessionId: string) => void
  onNewSession: () => void
  onRenameSession: (sessionId: string) => void
  onSelectSession: (sessionId: string) => void
  onTogglePinSession: (sessionId: string) => void
  sessions: ChatSessionPreview[]
  selectedSessionId: string | null
  sidebarOpen: boolean
  userEmail: string | null
}) {
  const sessionsScrollRef = useScrollRestoration('chat-sidebar-sessions')

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-(--mst-color-border-default) bg-white/84 text-(--mst-color-text-primary) backdrop-blur-xl transition-transform duration-200 ease-linear dark:bg-slate-950/68 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-(--mst-color-border-default) p-3">
        <div className="flex items-center justify-between gap-2">
          <AppBrand
            className="min-w-0"
            labelClassName="block truncate"
            logoClassName="rounded-xl shadow-(--mst-shadow-sm)"
          />

          <div className="flex flex-row gap-1">
            <Tooltip
              align={{ offset: [0, 6] }}
              autoAdjustOverflow={false}
              arrow={false}
              placement="bottom"
              title="删除所有会话"
              variant="surface"
              zIndex={1200}
            >
              <button
                aria-label="删除所有会话记录"
                className="inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-red-500 dark:hover:bg-white/6"
                onClick={onDeleteAllSessions}
                type="button"
              >
                <Trash className="size-4" />
              </button>
            </Tooltip>
            <Tooltip
              align={{ offset: [0, 6] }}
              autoAdjustOverflow={false}
              arrow={false}
              placement="bottom"
              title="新建会话"
              variant="surface"
              zIndex={1200}
            >
              <button
                aria-label="新建会话"
                className="mr-1 inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-blue-500 dark:hover:bg-white/6"
                onClick={onNewSession}
                type="button"
              >
                <Plus className="size-4" />
              </button>
            </Tooltip>
            <button
              aria-label="关闭侧栏"
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full p-2 text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-(--mst-color-primary) md:hidden dark:hover:bg-white/6"
              onClick={onCloseSidebar}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-auto px-2 py-2"
        ref={sessionsScrollRef}
      >
        <div className="flex flex-col gap-1">
          {sessions.map((session) => (
            <ChatSidebarSessionItem
              active={session.id === selectedSessionId}
              key={session.id}
              onDelete={() => onDeleteSession(session.id)}
              onRename={() => onRenameSession(session.id)}
              onSelect={() => onSelectSession(session.id)}
              onTogglePin={() => onTogglePinSession(session.id)}
              session={session}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-(--mst-color-border-default) p-2">
        <AuthEntry userEmail={userEmail} variant="sidebar" />
      </div>
    </aside>
  )
}
