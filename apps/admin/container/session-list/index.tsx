'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Button,
  Drawer,
  Filter,
  FormField,
  Input,
  Select,
  Table,
  X,
} from '@mianshitong/ui'
import type {
  AdminSessionFilters,
  AdminSessionListResult,
} from '@/server/session/service'
import { Title } from '@/ui'
import { buildSessionsHref } from './build-sessions-href'
import { useColumns } from './use-columns'

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
  const [draftFilters, setDraftFilters] = useState(filters)
  const [searchValue, setSearchValue] = useState(filters.query)
  const { columns } = useColumns({ filters })
  const activeAdvancedFilterCount = [
    filters.userId,
    filters.userEmail,
    filters.userType !== 'all' ? filters.userType : '',
    filters.createdFrom || filters.createdTo ? 'createdRange' : '',
    filters.updatedFrom || filters.updatedTo ? 'updatedRange' : '',
  ].filter(Boolean).length
  const hasAnyActiveFilter = activeAdvancedFilterCount > 0

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    setSearchValue(filters.query)
  }, [filters.query])

  function pushFilters(nextFilters: AdminSessionFilters) {
    router.push(buildSessionsHref(nextFilters), {
      scroll: false,
    })
  }

  function pushPartialFilters(partial: Partial<AdminSessionFilters>) {
    pushFilters({
      ...filters,
      ...partial,
    })
  }

  function updateDraftFilters(patch: Partial<AdminSessionFilters>) {
    setDraftFilters((currentValue) => ({
      ...currentValue,
      ...patch,
    }))
  }

  function clearAllFilters() {
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

    setDrawerOpen(false)
    setSearchValue('')
    setDraftFilters(nextFilters)
    router.replace(buildSessionsHref(nextFilters), {
      scroll: false,
    })
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQuery = searchValue.trim()

      if (nextQuery === filters.query) {
        return
      }

      router.replace(
        buildSessionsHref({
          ...filters,
          page: 1,
          query: nextQuery,
        }),
        {
          scroll: false,
        }
      )
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [filters, router, searchValue])

  return (
    <div>
      <Title>会话管理</Title>

      <div className="mb-4 flex justify-end gap-3">
        <Input
          allowClear
          className="max-w-70"
          suffix={null}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="搜索会话标题"
          value={searchValue}
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
            onClick={() => setDrawerOpen(true)}
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
              className="cursor-pointer pointer-events-none absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 opacity-0 transition hover:bg-slate-200/70 hover:text-slate-600 group-hover:pointer-events-auto group-hover:opacity-100"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                clearAllFilters()
              }}
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
          onChange: (page, pageSize) => {
            pushPartialFilters({
              page: pageSize !== filters.pageSize ? 1 : page,
              pageSize,
            })
          },
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      <Drawer
        destroyOnHidden={false}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title="筛选"
        width={420}
      >
        <div className="space-y-5">
          <FormField label="用户 ID">
            <Input
              onChange={(event) =>
                updateDraftFilters({ userId: event.target.value })
              }
              placeholder="支持输入完整或部分用户 ID"
              value={draftFilters.userId}
            />
          </FormField>

          <FormField label="用户邮箱">
            <Input
              onChange={(event) =>
                updateDraftFilters({ userEmail: event.target.value })
              }
              placeholder="输入邮箱关键词"
              value={draftFilters.userEmail}
            />
          </FormField>
          <FormField label="用户类型">
            <Select
              className="w-full"
              onChange={(value) =>
                updateDraftFilters({
                  userType: value as AdminSessionFilters['userType'],
                })
              }
              options={[...USER_TYPE_OPTIONS]}
              value={draftFilters.userType}
            />
          </FormField>

          <FormField label="创建时间范围">
            <div className="grid grid-cols-2 gap-3">
              <Input
                onChange={(event) =>
                  updateDraftFilters({ createdFrom: event.target.value })
                }
                type="date"
                value={draftFilters.createdFrom}
              />
              <Input
                onChange={(event) =>
                  updateDraftFilters({ createdTo: event.target.value })
                }
                type="date"
                value={draftFilters.createdTo}
              />
            </div>
          </FormField>

          <FormField label="更新时间范围">
            <div className="grid grid-cols-2 gap-3">
              <Input
                onChange={(event) =>
                  updateDraftFilters({ updatedFrom: event.target.value })
                }
                type="date"
                value={draftFilters.updatedFrom}
              />
              <Input
                onChange={(event) =>
                  updateDraftFilters({ updatedTo: event.target.value })
                }
                type="date"
                value={draftFilters.updatedTo}
              />
            </div>
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button onClick={clearAllFilters}>清空</Button>
            <Button
              onClick={() => {
                pushFilters({
                  ...draftFilters,
                  page: 1,
                  query: filters.query,
                })
                setDrawerOpen(false)
              }}
              variant="primary"
            >
              确定
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
