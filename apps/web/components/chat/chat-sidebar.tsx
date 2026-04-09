'use client'

import Link from 'next/link'
import {
  ChevronLeft,
  MianshitongLogoMark,
  Plus,
  Tooltip,
  Trash,
} from '@mianshitong/ui'
import { type ChatSessionPreview } from './chat-data'
import { ChatSidebarSessionItem } from './chat-sidebar-session-item'
import { ChatSidebarUserMenu } from './chat-sidebar-user-menu'

export function ChatSidebar({
  onCloseSidebar,
  onDeleteSession,
  onLogout,
  onNewSession,
  onSelectSession,
  onTogglePinSession,
  sessions,
  selectedSessionId,
  sidebarOpen,
  userEmail,
}: {
  onCloseSidebar: () => void
  onDeleteSession: (sessionId: string) => void
  onLogout: () => void
  onNewSession: () => void
  onSelectSession: (sessionId: string) => void
  onTogglePinSession: (sessionId: string) => void
  sessions: ChatSessionPreview[]
  selectedSessionId: string | null
  sidebarOpen: boolean
  userEmail: string | null
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-(--mst-color-border-default) bg-white/84 text-(--mst-color-text-primary) backdrop-blur-xl transition-transform duration-200 ease-linear dark:bg-slate-950/68 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-(--mst-color-border-default) p-3">
        <div className="flex items-center justify-between gap-2">
          <Link className="flex min-w-0 flex-row items-center gap-2.5" href="/">
            <MianshitongLogoMark
              aria-hidden="true"
              className="size-8 rounded-xl shadow-(--mst-shadow-sm)"
            />
            <span className="block truncate text-base font-semibold text-(--mst-color-primary)">
              面试通
            </span>
          </Link>

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
                className="cursor-pointer inline-flex items-center justify-center rounded-full p-2 text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-red-500 dark:hover:bg-white/6"
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
                className="cursor-pointer mr-1 inline-flex items-center justify-center rounded-full p-2 text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-blue-500 dark:hover:bg-white/6"
                onClick={onNewSession}
                type="button"
              >
                <Plus className="size-4" />
              </button>
            </Tooltip>
            <button
              aria-label="关闭侧栏"
              className="cursor-pointer inline-flex h-9 items-center justify-center rounded-full p-2 text-(--mst-color-text-muted) transition-colors hover:bg-slate-900/4 hover:text-(--mst-color-primary) md:hidden dark:hover:bg-white/6"
              onClick={onCloseSidebar}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-2 py-2">
        <div className="flex flex-col gap-1">
          {sessions.map((session) => (
            <ChatSidebarSessionItem
              active={session.id === selectedSessionId}
              key={session.id}
              onDelete={() => onDeleteSession(session.id)}
              onSelect={() => onSelectSession(session.id)}
              onTogglePin={() => onTogglePinSession(session.id)}
              session={session}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-(--mst-color-border-default) p-2">
        <ChatSidebarUserMenu onLogout={onLogout} userEmail={userEmail} />
      </div>
    </aside>
  )
}
