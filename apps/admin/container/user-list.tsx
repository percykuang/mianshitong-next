'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Button,
  Dropdown,
  FormField,
  Input,
  Modal,
  MoreHorizontal,
  Table,
  Tag,
  TypographyText,
  useAppInstance,
  type TableColumnsType,
} from '@mianshitong/ui'
import type { AdminUserListResult } from '@/server/user/service'
import { Title } from '@/ui'

type AdminUserItem = AdminUserListResult['items'][number]
const MAX_DAILY_MODEL_QUOTA = 100_000

function buildUsersHref(input: { page: number; pageSize: number }) {
  const searchParams = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  })

  return `/users?${searchParams.toString()}`
}

function createMenuItems() {
  return [
    {
      key: 'view-sessions',
      label: '查看会话',
    },
    {
      key: 'edit-quota',
      label: '修改配额',
    },
    {
      key: 'delete-user',
      danger: true,
      label: '删除用户',
    },
  ]
}

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

  function pushUsersHref(input: {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: string
  }) {
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

  async function handleDeleteUser(user: AdminUserItem) {
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

  function openQuotaEditor(user: AdminUserItem) {
    setQuotaEditor({
      user,
      value: String(user.dailyModelQuota),
      error: '',
    })
  }

  function closeQuotaEditor() {
    if (quotaSaving) {
      return
    }

    setQuotaEditor(null)
  }

  function updateQuotaEditorValue(value: string) {
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

  function parseDailyModelQuota(value: string) {
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

  async function handleSaveDailyModelQuota() {
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

  const columns: TableColumnsType<AdminUserItem> = [
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
      align: 'center',
      key: 'actions',
      render: (_, user) => (
        <Dropdown
          menu={{
            items: createMenuItems(),
            onClick: ({ key }) => {
              if (key === 'view-sessions') {
                router.push(`/sessions?userId=${encodeURIComponent(user.id)}`)
                return
              }
              if (key === 'edit-quota') {
                openQuotaEditor(user)
                return
              }
              if (key === 'delete-user') {
                void handleDeleteUser(user)
              }
            },
          }}
          trigger={['click']}
        >
          <Button
            className="border-none rounded-tr-sm bg-transparent shadow-none hover:bg-gray-950/4"
            aria-label={`操作 ${user.email}`}
            icon={<MoreHorizontal className="size-4" />}
            variant="text"
          />
        </Dropdown>
      ),
      title: '操作',
      width: 100,
    },
  ]

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
          onChange: (page, pageSize) => {
            pushUsersHref({
              page: pageSize !== query.pageSize ? 1 : page,
              pageSize,
            })
          },
        }}
        rowKey="id"
        scroll={{ x: 1220 }}
      />
      <Modal
        centered
        confirmLoading={quotaSaving}
        confirmText="保存"
        onCancel={closeQuotaEditor}
        onOk={() => void handleSaveDailyModelQuota()}
        open={Boolean(quotaEditor)}
        title="修改模型配额"
      >
        {quotaEditor ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <TypographyText className="text-sm text-slate-600">
                当前用户：{quotaEditor.user.email}
              </TypographyText>
            </div>

            <FormField
              error={quotaEditor.error}
              hint="访客默认每天 10 次，注册用户默认每天 20 次；这里会覆盖当前注册用户的每日模型配额。"
              label="每日模型配额"
            >
              <Input
                autoFocus
                inputMode="numeric"
                max={MAX_DAILY_MODEL_QUOTA}
                min={0}
                onChange={(event) => updateQuotaEditorValue(event.target.value)}
                placeholder="请输入每日可用次数"
                step={1}
                type="number"
                value={quotaEditor.value}
              />
            </FormField>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
