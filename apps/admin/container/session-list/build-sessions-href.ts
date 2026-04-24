import { buildPathWithSearchParams } from '@mianshitong/shared/runtime'

import type { AdminSessionFilters } from '@/server/session'

const DEFAULT_SESSION_PAGE_SIZE = 10

export function buildSessionsHref(filters: AdminSessionFilters) {
  return buildPathWithSearchParams('/sessions', {
    page: filters.page !== 1 ? filters.page : undefined,
    pageSize:
      filters.pageSize !== DEFAULT_SESSION_PAGE_SIZE
        ? filters.pageSize
        : undefined,
    query: filters.query || undefined,
    userId: filters.userId || undefined,
    userEmail: filters.userEmail || undefined,
    userType: filters.userType !== 'all' ? filters.userType : undefined,
    createdFrom: filters.createdFrom || undefined,
    createdTo: filters.createdTo || undefined,
    updatedFrom: filters.updatedFrom || undefined,
    updatedTo: filters.updatedTo || undefined,
    sortBy: filters.sortBy !== 'updatedAt' ? filters.sortBy : undefined,
    sortOrder: filters.sortOrder !== 'desc' ? filters.sortOrder : undefined,
  })
}
