'use client'

import { Button, Dropdown, MoreHorizontal } from '@mianshitong/ui'

import type { AdminUserListResult } from '@/server/user/service'

type AdminUserItem = AdminUserListResult['items'][number]

const USER_ACTION_MENU_ITEMS = [
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

interface UserActionsDropdownProps {
	onDeleteUser: (user: AdminUserItem) => Promise<void>
	onOpenQuotaEditor: (user: AdminUserItem) => void
	onViewSessions: (user: AdminUserItem) => void
	user: AdminUserItem
}

export function UserActionsDropdown({
	onDeleteUser,
	onOpenQuotaEditor,
	onViewSessions,
	user,
}: UserActionsDropdownProps) {
	const handleMenuClick = ({ key }: { key: string }) => {
		if (key === 'view-sessions') {
			onViewSessions(user)
			return
		}

		if (key === 'edit-quota') {
			onOpenQuotaEditor(user)
			return
		}

		if (key === 'delete-user') {
			void onDeleteUser(user)
		}
	}

	return (
		<Dropdown
			menu={{
				items: USER_ACTION_MENU_ITEMS,
				onClick: handleMenuClick,
			}}
			trigger={['click']}
		>
			<Button
				aria-label={`操作 ${user.email}`}
				className="rounded-tr-sm border-none bg-transparent shadow-none hover:bg-gray-950/4"
				icon={<MoreHorizontal className="size-4" />}
				variant="text"
			/>
		</Dropdown>
	)
}
