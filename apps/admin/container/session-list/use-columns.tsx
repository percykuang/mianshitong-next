'use client'

import { useRouter } from 'next/navigation'
import {
  Modal,
  Button,
  MoreHorizontal,
  Tag,
  Dropdown,
  TypographyText,
  useAppInstance,
  type TableColumnsType,
} from '@mianshitong/ui'
import type {
  AdminSessionFilters,
  AdminSessionListResult,
} from '@/server/session/service'
import { buildSessionsHref } from './build-sessions-href'

type AdminSessionItem = AdminSessionListResult['items'][number]

function getStatusLabel(status: AdminSessionItem['status']) {
  if (status === 'interrupted') {
    return '已中断'
  }

  if (status === 'pending') {
    return '待完成'
  }

  return '已完成'
}

function getStatusColor(status: AdminSessionItem['status']) {
  if (status === 'interrupted') {
    return 'gold'
  }

  if (status === 'pending') {
    return 'blue'
  }

  return 'green'
}

function getUserTypeLabel(type: AdminSessionItem['userType']) {
  return type === 'guest' ? '访客' : '注册用户'
}

export function useColumns({ filters }: { filters: AdminSessionFilters }) {
  const router = useRouter()
  const { message } = useAppInstance()

  async function deleteSession(sessionId: string) {
    const response = await fetch(`/api/sessions/${sessionId}`, {
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

  return {
    columns: [
      {
        dataIndex: 'id',
        key: 'id',
        render: (value: string) => (
          <TypographyText code className="text-xs">
            {value}
          </TypographyText>
        ),
        title: 'ID',
        width: 260,
      },
      {
        key: 'userLabel',
        render: (_, session) => (
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-[#111827]">
              {session.userLabel}
            </span>
            <Tag color={session.userType === 'guest' ? 'default' : 'blue'}>
              {getUserTypeLabel(session.userType)}
            </Tag>
          </div>
        ),
        title: '用户',
        width: 280,
      },
      {
        dataIndex: 'title',
        key: 'title',
        render: (value: string) => (
          <span className="admin-ellipsis" title={value || '未命名'}>
            {value || '未命名'}
          </span>
        ),
        title: '标题',
        width: 320,
      },
      {
        key: 'status',
        render: (_, session) => (
          <Tag color={getStatusColor(session.status)}>
            {getStatusLabel(session.status)}
          </Tag>
        ),
        title: '状态',
        width: 120,
      },
      {
        dataIndex: 'messageCount',
        key: 'messageCount',
        title: '消息数',
        width: 110,
      },
      {
        dataIndex: 'createdAtLabel',
        key: 'createdAtLabel',
        title: '创建时间',
        width: 180,
      },
      {
        dataIndex: 'updatedAtLabel',
        key: 'updatedAtLabel',
        title: '更新时间',
        width: 180,
      },
      {
        key: 'actions',
        render: (_, session) => (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'view-detail',
                  label: '查看详情',
                },
                {
                  type: 'divider',
                },
                {
                  danger: true,
                  key: 'delete-session',
                  label: '删除会话',
                },
              ],
              onClick: ({ key }) => {
                if (key === 'view-detail') {
                  router.push(
                    `/sessions/${session.id}?from=${encodeURIComponent(buildSessionsHref(filters))}`
                  )
                  return
                }

                if (key === 'delete-session') {
                  Modal.confirm({
                    cancelText: '取消',
                    confirmText: '确认',
                    content: `将删除会话「${session.title || '未命名'}」，此操作无法撤销。`,
                    okButtonProps: {
                      danger: true,
                    },
                    onOk: async () => {
                      await deleteSession(session.id)
                    },
                    title: '确认删除该会话？',
                  })
                }
              },
            }}
          >
            <Button
              className="border-none rounded-tr-sm bg-transparent shadow-none hover:bg-gray-950/4"
              aria-label={`操作 ${session.id}`}
              icon={<MoreHorizontal className="size-4" />}
              variant="text"
            />
          </Dropdown>
        ),
        title: '操作',
        width: 92,
      },
    ] as TableColumnsType<AdminSessionItem>,
  }
}
