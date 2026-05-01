'use client'

import {
  Button,
  Dropdown,
  Modal,
  MoreHorizontal,
  useAppInstance,
} from '@mianshitong/ui'
import { useRouter } from 'next/navigation'

import type { AdminChatModelListResult } from '@/server/model'

type AdminChatModelItem = AdminChatModelListResult['items'][number]

const MODEL_ACTION_MENU_ITEMS = [
  {
    key: 'edit-model',
    label: '编辑模型',
  },
  {
    type: 'divider' as const,
  },
  {
    danger: true,
    key: 'delete-model',
    label: '删除模型',
  },
]

interface ModelActionsDropdownProps {
  model: AdminChatModelItem
  onEditModel: (model: AdminChatModelItem) => void
}

export function ModelActionsDropdown({
  model,
  onEditModel,
}: ModelActionsDropdownProps) {
  const router = useRouter()
  const { message } = useAppInstance()

  const deleteModel = async () => {
    const response = await fetch(`/api/models/${model.id}`, {
      method: 'DELETE',
    })

    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (!response.ok) {
      throw new Error(payload?.error ?? '删除模型失败，请稍后重试')
    }

    message.success('模型配置已删除')
    router.refresh()
  }

  const openDeleteConfirm = () => {
    Modal.confirm({
      title: '删除模型配置',
      content: `确认删除模型 ${model.label} 吗？此操作无法撤销。`,
      okButtonProps: {
        danger: true,
      },
      onOk: deleteModel,
    })
  }

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'edit-model') {
      onEditModel(model)
      return
    }

    if (key === 'delete-model') {
      openDeleteConfirm()
    }
  }

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: MODEL_ACTION_MENU_ITEMS,
        onClick: handleMenuClick,
      }}
    >
      <Button
        aria-label={`操作 ${model.label}`}
        className="rounded-tr-sm border-none bg-transparent shadow-none hover:bg-gray-950/4"
        icon={<MoreHorizontal className="size-4" />}
        variant="text"
      />
    </Dropdown>
  )
}
