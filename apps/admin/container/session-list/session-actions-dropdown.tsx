'use client'

import {
  Button,
  Dropdown,
  Modal,
  MoreHorizontal,
  useAppInstance,
} from '@mianshitong/ui'
import { useRouter } from 'next/navigation'

import type {
  AdminSessionFilters,
  AdminSessionListResult,
} from '@/server/session'

import { buildSessionsHref } from './build-sessions-href'

type AdminSessionItem = AdminSessionListResult['items'][number]

const SESSION_ACTION_MENU_ITEMS = [
  {
    key: 'view-detail',
    label: '查看详情',
  },
  {
    type: 'divider' as const,
  },
  {
    danger: true,
    key: 'delete-session',
    label: '删除会话',
  },
]

interface SessionActionsDropdownProps {
  filters: AdminSessionFilters
  session: AdminSessionItem
}

export function SessionActionsDropdown({
  filters,
  session,
}: SessionActionsDropdownProps) {
  const router = useRouter()
  const { message } = useAppInstance()

  const deleteSession = async () => {
    const response = await fetch(`/api/sessions/${session.id}`, {
      method: 'DELETE',
    })

    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (!response.ok) {
      throw new Error(payload?.error ?? '删除失败，请稍后重试')
    }

    message.success('会话已删除')
    router.refresh()
  }

  const openSessionDetail = () => {
    router.push(
      `/sessions/${session.id}?from=${encodeURIComponent(buildSessionsHref(filters))}`
    )
  }

  const openDeleteConfirm = () => {
    Modal.confirm({
      cancelText: '取消',
      confirmText: '确认',
      content: `将删除会话「${session.title || '未命名'}」，此操作无法撤销。`,
      okButtonProps: {
        danger: true,
      },
      onOk: deleteSession,
      title: '确认删除该会话？',
    })
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'view-detail') {
      openSessionDetail()
      return
    }

    if (key === 'delete-session') {
      openDeleteConfirm()
    }
  }

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: SESSION_ACTION_MENU_ITEMS,
        onClick: handleMenuClick,
      }}
    >
      <Button
        aria-label={`操作 ${session.id}`}
        className="rounded-tr-sm border-none bg-transparent shadow-none hover:bg-gray-950/4"
        icon={<MoreHorizontal className="size-4" />}
        variant="text"
      />
    </Dropdown>
  )
}
