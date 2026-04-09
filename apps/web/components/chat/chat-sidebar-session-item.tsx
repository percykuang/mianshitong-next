'use client'

import { useRef, useState } from 'react'
import { MoreHorizontal, Pin, Popover } from '@mianshitong/ui'
import { type ChatSessionPreview } from './chat-data'

interface ChatSidebarSessionItemProps {
  active: boolean
  onDelete: () => void
  onSelect: () => void
  onTogglePin: () => void
  session: ChatSessionPreview
}

export function ChatSidebarSessionItem({
  active,
  onDelete,
  onSelect,
  onTogglePin,
  session,
}: ChatSidebarSessionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  function closeMenuThenRun(action: () => void) {
    setMenuOpen(false)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(action)
    })
  }

  return (
    <div
      data-chat-session-item
      className={`group/session relative flex min-w-0 items-center rounded-[18px] px-3 py-0.5 transition-colors duration-200 ${
        active
          ? 'bg-slate-900/6 text-(--mst-color-text-primary) dark:bg-white/7'
          : 'text-(--mst-color-text-secondary) hover:bg-slate-900/4 hover:text-(--mst-color-text-primary) dark:hover:bg-white/6'
      }`}
    >
      <button
        className="flex min-w-0 flex-1 cursor-pointer items-center rounded-[14px] py-1 text-left"
        onClick={onSelect}
        type="button"
      >
        <span className="block min-w-0 flex-1 truncate text-sm leading-6 font-medium">
          {session.title}
        </span>
      </button>

      <div
        className={`relative flex h-8 shrink-0 items-center justify-center self-center transition-[width,margin,opacity] duration-150 ${
          menuOpen ? 'overflow-visible' : 'overflow-hidden'
        } ${
          session.pinned || menuOpen
            ? 'ml-1 w-8 opacity-100'
            : 'ml-0 w-0 opacity-0 group-hover/session:ml-1 group-hover/session:w-8 group-hover/session:opacity-100'
        }`}
      >
        {session.pinned ? (
          <span
            aria-label="已置顶"
            className={`pointer-events-none absolute inset-0 inline-flex items-center justify-center text-(--mst-color-primary) transition-opacity duration-150 ${
              menuOpen
                ? 'opacity-0'
                : 'opacity-100 group-hover/session:opacity-0'
            }`}
          >
            <Pin className="size-3.5" />
          </span>
        ) : null}

        <button
          aria-label="更多操作"
          className={`absolute inset-0 m-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-xl p-0 text-(--mst-color-text-muted) transition-[opacity,color,background-color] duration-150 hover:bg-slate-900/5 hover:text-(--mst-color-text-primary) dark:hover:bg-white/7 ${
            menuOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0 group-hover/session:pointer-events-auto group-hover/session:opacity-100'
          }`}
          onClick={(event) => {
            event.stopPropagation()
            setMenuOpen((current) => !current)
          }}
          onMouseDown={(event) => {
            event.stopPropagation()
          }}
          ref={triggerRef}
          type="button"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      <Popover
        anchorRef={triggerRef}
        className="min-w-24 rounded-xl border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) p-1 shadow-(--mst-shadow-lg)"
        offset={6}
        onOpenChange={setMenuOpen}
        open={menuOpen}
        placement="bottom-start"
      >
        <button
          className="flex w-full cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] text-(--mst-color-text-primary) transition-colors hover:bg-slate-900/4 dark:hover:bg-white/6"
          onClick={(event) => {
            event.stopPropagation()
            closeMenuThenRun(onTogglePin)
          }}
          type="button"
        >
          {session.pinned ? '取消置顶' : '置顶会话'}
        </button>
        <button
          className="flex w-full cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] text-red-500 transition-colors hover:bg-red-500/8"
          onClick={(event) => {
            event.stopPropagation()
            closeMenuThenRun(onDelete)
          }}
          type="button"
        >
          删除会话
        </button>
      </Popover>
    </div>
  )
}
