'use client'

import { Input, Modal } from '@mianshitong/ui'
import { type ChatSessionPreview } from '@/components'

interface DeleteSessionDialogProps {
  onCancel: () => void
  onConfirm: () => void
  session: ChatSessionPreview | null
}

interface RenameSessionDialogProps {
  draft: string
  onCancel: () => void
  onConfirm: () => void
  onDraftChange: (value: string) => void
  session: ChatSessionPreview | null
}

export function DeleteSessionDialog({
  onCancel,
  onConfirm,
  session,
}: DeleteSessionDialogProps) {
  return (
    <Modal
      cancelText="取消"
      centered
      confirmText="删除"
      okButtonProps={{ danger: true }}
      onCancel={onCancel}
      onOk={onConfirm}
      open={Boolean(session)}
      title="删除会话"
    >
      <p className="m-0 pt-1 text-sm leading-6 text-(--mst-color-text-secondary)">
        {`确认删除会话「${session?.title ?? ''}」吗？删除后将无法恢复。`}
      </p>
    </Modal>
  )
}

export function RenameSessionDialog({
  draft,
  onCancel,
  onConfirm,
  onDraftChange,
  session,
}: RenameSessionDialogProps) {
  return (
    <Modal
      cancelText="取消"
      centered
      confirmText="保存"
      okButtonProps={{ disabled: !draft.trim() }}
      onCancel={onCancel}
      onOk={onConfirm}
      open={Boolean(session)}
      title="重命名会话"
    >
      <div className="pt-1">
        <Input
          autoFocus
          maxLength={60}
          onChange={(event) => onDraftChange(event.target.value)}
          onPressEnter={onConfirm}
          placeholder="请输入会话名称"
          value={draft}
        />
      </div>
    </Modal>
  )
}
