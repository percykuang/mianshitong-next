'use client'

import { FormField, Input, Modal, TypographyText } from '@mianshitong/ui'

import type { AdminUserListResult } from '@/server/user/service'

type AdminUserItem = AdminUserListResult['items'][number]

export const MAX_DAILY_MODEL_QUOTA = 100_000

interface QuotaEditorState {
	error: string
	user: AdminUserItem
	value: string
}

interface UserQuotaEditorModalProps {
	onCancel: () => void
	onConfirm: () => void
	onValueChange: (value: string) => void
	quotaEditor: QuotaEditorState | null
	quotaSaving: boolean
}

export function UserQuotaEditorModal({
	onCancel,
	onConfirm,
	onValueChange,
	quotaEditor,
	quotaSaving,
}: UserQuotaEditorModalProps) {
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onValueChange(event.target.value)
	}

	return (
		<Modal
			centered
			confirmLoading={quotaSaving}
			confirmText="保存"
			onCancel={onCancel}
			onOk={onConfirm}
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
							onChange={handleInputChange}
							placeholder="请输入每日可用次数"
							step={1}
							type="number"
							value={quotaEditor.value}
						/>
					</FormField>
				</div>
			) : null}
		</Modal>
	)
}
