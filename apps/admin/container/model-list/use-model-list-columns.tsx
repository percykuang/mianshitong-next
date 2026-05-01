'use client'

import { type TableColumnsType, Tag } from '@mianshitong/ui'

import type { AdminChatModelListResult } from '@/server/model'

import { ModelActionsDropdown } from './model-actions-dropdown'

type AdminChatModelItem = AdminChatModelListResult['items'][number]

function getProviderLabel(provider: AdminChatModelItem['provider']) {
  if (provider === 'deepseek') {
    return 'DeepSeek'
  }

  if (provider === 'ollama') {
    return 'Ollama'
  }

  return 'OpenAI Compatible'
}

interface UseModelListColumnsInput {
  onEditModel: (model: AdminChatModelItem) => void
}

export function useModelListColumns({ onEditModel }: UseModelListColumnsInput) {
  return {
    columns: [
      {
        dataIndex: 'id',
        key: 'id',
        render: (value: string) => (
          <code className="rounded-md bg-slate-900/6 px-1.5 py-0.5 font-mono text-xs text-[#374151]">
            {value}
          </code>
        ),
        title: 'ID',
        width: 220,
      },
      {
        key: 'label',
        render: (_, model: AdminChatModelItem) => (
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-[#111827]">
              {model.label}
            </span>
            {model.isDefault ? <Tag color="blue">默认</Tag> : null}
          </div>
        ),
        title: '显示名称',
        width: 220,
      },
      {
        dataIndex: 'enabled',
        key: 'enabled',
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'default'}>
            {value ? '启用' : '停用'}
          </Tag>
        ),
        title: '状态',
        width: 100,
      },
      {
        dataIndex: 'provider',
        key: 'provider',
        render: (value: AdminChatModelItem['provider']) => (
          <Tag>{getProviderLabel(value)}</Tag>
        ),
        title: '提供方',
        width: 170,
      },
      {
        dataIndex: 'model',
        key: 'model',
        title: '模型名',
        width: 220,
      },
      {
        dataIndex: 'baseUrl',
        key: 'baseUrl',
        render: (value: string) => (
          <span className="admin-ellipsis" title={value}>
            {value}
          </span>
        ),
        title: 'Base URL',
        width: 280,
      },
      {
        dataIndex: 'supportsJsonOutput',
        key: 'supportsJsonOutput',
        render: (value: boolean) => (
          <Tag color={value ? 'green' : 'default'}>
            {value ? '支持 JSON' : '提示词 JSON'}
          </Tag>
        ),
        title: '结构化输出',
        width: 140,
      },
      {
        dataIndex: 'apiKeyPreview',
        key: 'apiKeyPreview',
        title: '密钥',
        width: 140,
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
        render: (_, model: AdminChatModelItem) => (
          <ModelActionsDropdown model={model} onEditModel={onEditModel} />
        ),
        title: '操作',
        width: 92,
      },
    ] as TableColumnsType<AdminChatModelItem>,
  }
}
