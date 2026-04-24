'use client'

import { type TableColumnsType, Tag, TypographyText } from '@mianshitong/ui'

import type { AdminUserListResult } from '@/server/user'

import { UserActionsDropdown } from './user-actions-dropdown'

type AdminUserItem = AdminUserListResult['items'][number]

interface UseUserListColumnsInput {
  onDeleteUser: (user: AdminUserItem) => Promise<void>
  onOpenQuotaEditor: (user: AdminUserItem) => void
  onViewSessions: (user: AdminUserItem) => void
}

export function useUserListColumns({
  onDeleteUser,
  onOpenQuotaEditor,
  onViewSessions,
}: UseUserListColumnsInput) {
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
        dataIndex: 'email',
        ellipsis: true,
        key: 'email',
        title: '邮箱',
        width: 260,
      },
      {
        dataIndex: 'createdAtLabel',
        key: 'createdAtLabel',
        title: '注册时间',
        width: 200,
      },
      {
        dataIndex: 'dailyModelQuota',
        key: 'dailyModelQuota',
        render: (value: number) => <Tag color="blue">{value} 次/天</Tag>,
        title: '模型配额',
        width: 140,
      },
      {
        dataIndex: 'todayUsedQuota',
        key: 'todayUsedQuota',
        render: (value: number) => <Tag>{value}</Tag>,
        title: '今日已用配额',
        width: 140,
      },
      {
        dataIndex: 'sessionCount',
        key: 'sessionCount',
        render: (value: number) => <Tag>{value}</Tag>,
        title: '会话数量',
        width: 120,
      },
      {
        fixed: 'right',
        align: 'center',
        key: 'actions',
        render: (_, user: AdminUserItem) => (
          <UserActionsDropdown
            onDeleteUser={onDeleteUser}
            onOpenQuotaEditor={onOpenQuotaEditor}
            onViewSessions={onViewSessions}
            user={user}
          />
        ),
        title: '操作',
        width: 100,
      },
    ] as TableColumnsType<AdminUserItem>,
  }
}
