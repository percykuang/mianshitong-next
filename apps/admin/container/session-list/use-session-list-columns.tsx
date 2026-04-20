'use client'

import { type TableColumnsType, Tag, TypographyText } from '@mianshitong/ui'

import type {
  AdminSessionFilters,
  AdminSessionListResult,
} from '@/server/session/service'

import { SessionActionsDropdown } from './session-actions-dropdown'

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

export function useSessionListColumns({
  filters,
}: {
  filters: AdminSessionFilters
}) {
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
        fixed: 'right',
        key: 'actions',
        render: (_, session) => (
          <SessionActionsDropdown filters={filters} session={session} />
        ),
        title: '操作',
        width: 92,
      },
    ] as TableColumnsType<AdminSessionItem>,
  }
}
