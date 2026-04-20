'use client'

import { Button, Drawer, FormField, Input, Select } from '@mianshitong/ui'

import type { AdminSessionFilters } from '@/server/session/service'

const USER_TYPE_OPTIONS = [
  {
    label: '全部类型',
    value: 'all',
  },
  {
    label: '访客',
    value: 'guest',
  },
  {
    label: '注册用户',
    value: 'registered',
  },
] as const

interface SessionFiltersDrawerProps {
  draftFilters: AdminSessionFilters
  onApplyFilters: () => void
  onClearFilters: () => void
  onClose: () => void
  onUpdateDraftFilters: (patch: Partial<AdminSessionFilters>) => void
  open: boolean
}

export function SessionFiltersDrawer({
  draftFilters,
  onApplyFilters,
  onClearFilters,
  onClose,
  onUpdateDraftFilters,
  open,
}: SessionFiltersDrawerProps) {
  const handleDraftUserIdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateDraftFilters({ userId: event.target.value })
  }

  const handleDraftUserEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateDraftFilters({ userEmail: event.target.value })
  }

  const handleDraftUserTypeChange = (value: string) => {
    onUpdateDraftFilters({
      userType: value as AdminSessionFilters['userType'],
    })
  }

  const handleDraftCreatedFromChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateDraftFilters({ createdFrom: event.target.value })
  }

  const handleDraftCreatedToChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateDraftFilters({ createdTo: event.target.value })
  }

  const handleDraftUpdatedFromChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateDraftFilters({ updatedFrom: event.target.value })
  }

  const handleDraftUpdatedToChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdateDraftFilters({ updatedTo: event.target.value })
  }

  return (
    <Drawer
      destroyOnHidden={false}
      onClose={onClose}
      open={open}
      title="筛选"
      width={420}
    >
      <div className="space-y-5">
        <FormField label="用户 ID">
          <Input
            onChange={handleDraftUserIdChange}
            placeholder="支持输入完整或部分用户 ID"
            value={draftFilters.userId}
          />
        </FormField>

        <FormField label="用户邮箱">
          <Input
            onChange={handleDraftUserEmailChange}
            placeholder="输入邮箱关键词"
            value={draftFilters.userEmail}
          />
        </FormField>
        <FormField label="用户类型">
          <Select
            className="w-full"
            onChange={handleDraftUserTypeChange}
            options={[...USER_TYPE_OPTIONS]}
            value={draftFilters.userType}
          />
        </FormField>

        <FormField label="创建时间范围">
          <div className="grid grid-cols-2 gap-3">
            <Input
              onChange={handleDraftCreatedFromChange}
              type="date"
              value={draftFilters.createdFrom}
            />
            <Input
              onChange={handleDraftCreatedToChange}
              type="date"
              value={draftFilters.createdTo}
            />
          </div>
        </FormField>

        <FormField label="更新时间范围">
          <div className="grid grid-cols-2 gap-3">
            <Input
              onChange={handleDraftUpdatedFromChange}
              type="date"
              value={draftFilters.updatedFrom}
            />
            <Input
              onChange={handleDraftUpdatedToChange}
              type="date"
              value={draftFilters.updatedTo}
            />
          </div>
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button onClick={onClearFilters}>清空</Button>
          <Button onClick={onApplyFilters} variant="primary">
            确定
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
