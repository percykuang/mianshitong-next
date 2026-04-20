'use client'

import { useState } from 'react'

import { Modal, Table, useAppInstance } from '@mianshitong/ui'
import { useRouter } from 'next/navigation'

import type { AdminUserListResult } from '@/server/user/service'
import { Title } from '@/ui'

import { buildUsersHref } from './build-users-href'
import { useUserListColumns } from './use-user-list-columns'
import {
  MAX_DAILY_MODEL_QUOTA,
  UserQuotaEditorModal,
} from './user-quota-editor-modal'

type AdminUserItem = AdminUserListResult['items'][number]

export function UserList({ users }: { users: AdminUserListResult }) {
  const router = useRouter()
  const { message } = useAppInstance()
  const { items, pagination, query } = users
  const [quotaEditor, setQuotaEditor] = useState<{
    error: string
    user: AdminUserItem
    value: string
  } | null>(null)
  const [quotaSaving, setQuotaSaving] = useState(false)

  const pushUsersHref = (input: {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: string
  }) => {
    router.push(
      buildUsersHref({
        page: input.page ?? query.page,
        pageSize: input.pageSize ?? query.pageSize,
      }),
      {
        scroll: false,
      }
    )
  }

  const handleDeleteUser = async (user: AdminUserItem) => {
    Modal.confirm({
      title: '删除用户',
      content: `确认删除用户 ${user.email} 吗？该用户的登录信息和会话数据会一并删除。`,
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
        })

        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null

        if (!response.ok) {
          throw new Error(payload?.error ?? '删除用户失败，请稍后重试')
        }

        message.success('用户已删除')
        router.refresh()
      },
    })
  }

  const openQuotaEditor = (user: AdminUserItem) => {
    setQuotaEditor({
      user,
      value: String(user.dailyModelQuota),
      error: '',
    })
  }

  const closeQuotaEditor = () => {
    if (quotaSaving) {
      return
    }

    setQuotaEditor(null)
  }

  const updateQuotaEditorValue = (value: string) => {
    setQuotaEditor((currentValue) =>
      currentValue
        ? {
            ...currentValue,
            value,
            error: '',
          }
        : currentValue
    )
  }

  const parseDailyModelQuota = (value: string) => {
    if (!value.trim()) {
      return null
    }

    const quota = Number(value)

    if (
      !Number.isSafeInteger(quota) ||
      quota < 0 ||
      quota > MAX_DAILY_MODEL_QUOTA
    ) {
      return null
    }

    return quota
  }

  const handleSaveDailyModelQuota = async () => {
    if (!quotaEditor) {
      return
    }

    const dailyModelQuota = parseDailyModelQuota(quotaEditor.value)

    if (dailyModelQuota === null) {
      setQuotaEditor({
        ...quotaEditor,
        error: `请输入 0 到 ${MAX_DAILY_MODEL_QUOTA} 之间的整数`,
      })
      return
    }

    setQuotaSaving(true)

    try {
      const response = await fetch(`/api/users/${quotaEditor.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyModelQuota,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(payload?.error ?? '修改模型配额失败，请稍后重试')
      }

      message.success('模型配额已更新')
      setQuotaEditor(null)
      router.refresh()
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '修改模型配额失败，请稍后重试'
      )
    } finally {
      setQuotaSaving(false)
    }
  }

  const handleViewUserSessions = (user: AdminUserItem) => {
    router.push(`/sessions?userId=${encodeURIComponent(user.id)}`)
  }

  const handleUsersPaginationChange = (page: number, pageSize: number) => {
    pushUsersHref({
      page: pageSize !== query.pageSize ? 1 : page,
      pageSize,
    })
  }

  const handleQuotaEditorConfirm = () => {
    void handleSaveDailyModelQuota()
  }

  const { columns } = useUserListColumns({
    onDeleteUser: handleDeleteUser,
    onOpenQuotaEditor: openQuotaEditor,
    onViewSessions: handleViewUserSessions,
  })

  return (
    <div>
      <Title>用户管理</Title>
      <Table<AdminUserItem>
        bordered
        columns={columns}
        dataSource={items}
        locale={{ emptyText: '暂无注册用户' }}
        pagination={{
          current: pagination.page,
          pageSize: query.pageSize,
          pageSizeOptions: [10, 20, 50],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          total: pagination.total,
          onChange: handleUsersPaginationChange,
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />
      <UserQuotaEditorModal
        onCancel={closeQuotaEditor}
        onConfirm={handleQuotaEditorConfirm}
        onValueChange={updateQuotaEditorValue}
        quotaEditor={quotaEditor}
        quotaSaving={quotaSaving}
      />
    </div>
  )
}
