'use client'

import { useState } from 'react'

import { Button, Filter, Input, Table, X } from '@mianshitong/ui'
import { useRouter } from 'next/navigation'

import type {
  AdminSessionFilters,
  AdminSessionListResult,
} from '@/server/session/service'
import { Title } from '@/ui'

import { buildSessionsHref } from './build-sessions-href'
import { SessionFiltersDrawer } from './session-filters-drawer'
import { useSessionListColumns } from './use-session-list-columns'
import { useSessionListSearch } from './use-session-list-search'

type AdminSessionItem = AdminSessionListResult['items'][number]

export function SessionList({
  filters,
  sessions,
}: {
  filters: AdminSessionFilters
  sessions: AdminSessionListResult
}) {
  const router = useRouter()
  const { items, pagination } = sessions
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<AdminSessionFilters | null>(
    null
  )
  const { handleSearchInputChange, resetSearchQuery, searchQuery } =
    useSessionListSearch({
      filters,
    })
  const { columns } = useSessionListColumns({ filters })
  const currentDraftFilters = draftFilters ?? filters
  const activeAdvancedFilterCount = [
    filters.userId,
    filters.userEmail,
    filters.userType !== 'all' ? filters.userType : '',
    filters.createdFrom || filters.createdTo ? 'createdRange' : '',
    filters.updatedFrom || filters.updatedTo ? 'updatedRange' : '',
  ].filter(Boolean).length
  const hasAnyActiveFilter = activeAdvancedFilterCount > 0

  const pushFilters = (nextFilters: AdminSessionFilters) => {
    router.push(buildSessionsHref(nextFilters), {
      scroll: false,
    })
  }

  const pushPartialFilters = (partial: Partial<AdminSessionFilters>) => {
    pushFilters({
      ...filters,
      ...partial,
    })
  }

  const updateDraftFilters = (patch: Partial<AdminSessionFilters>) => {
    setDraftFilters((currentValue) => ({
      ...(currentValue ?? filters),
      ...patch,
    }))
  }

  const openDrawer = () => {
    setDraftFilters(filters)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDraftFilters(null)
  }

  const clearAllFilters = () => {
    const nextFilters: AdminSessionFilters = {
      ...filters,
      page: 1,
      query: '',
      userId: '',
      userEmail: '',
      userType: 'all',
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: '',
    }

    closeDrawer()
    resetSearchQuery()

    router.replace(buildSessionsHref(nextFilters), {
      scroll: false,
    })
  }

  const handleClearAllFiltersButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    event.stopPropagation()
    clearAllFilters()
  }

  const handleSessionsPaginationChange = (page: number, pageSize: number) => {
    pushPartialFilters({
      page: pageSize !== filters.pageSize ? 1 : page,
      pageSize,
    })
  }

  const handleApplyFilters = () => {
    pushFilters({
      ...currentDraftFilters,
      page: 1,
      query: filters.query,
    })
    closeDrawer()
  }

  return (
    <div>
      <Title>会话管理</Title>

      <div className="mb-4 flex justify-end gap-3">
        <Input
          allowClear
          className="max-w-70"
          value={searchQuery}
          suffix={null}
          onChange={handleSearchInputChange}
          placeholder="搜索会话标题"
        />
        <div className="group relative">
          <Button
            className={[
              'pr-10',
              hasAnyActiveFilter
                ? 'border-sky-300! bg-sky-50! text-sky-700! hover:border-sky-400! hover:bg-sky-100! hover:text-sky-800!'
                : undefined,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={openDrawer}
            variant="secondary"
          >
            {activeAdvancedFilterCount > 0
              ? `筛选（${activeAdvancedFilterCount}）`
              : '筛选'}
          </Button>

          <span
            className={[
              'pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 transition',
              hasAnyActiveFilter
                ? 'text-sky-700 group-hover:opacity-0'
                : 'text-slate-500 group-hover:text-sky-700',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Filter className="size-4" />
          </span>

          {hasAnyActiveFilter ? (
            <button
              aria-label="清空所有筛选"
              className="pointer-events-none absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-slate-200/70 hover:text-slate-600"
              onClick={handleClearAllFiltersButtonClick}
              type="button"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <Table<AdminSessionItem>
        bordered
        columns={columns}
        dataSource={items}
        locale={{ emptyText: '当前筛选条件下没有会话数据' }}
        pagination={{
          current: pagination.page,
          pageSize: filters.pageSize,
          pageSizeOptions: [10, 20, 50],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          total: pagination.total,
          onChange: handleSessionsPaginationChange,
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      <SessionFiltersDrawer
        draftFilters={currentDraftFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={clearAllFilters}
        onClose={closeDrawer}
        onUpdateDraftFilters={updateDraftFilters}
        open={drawerOpen}
      />
    </div>
  )
}
