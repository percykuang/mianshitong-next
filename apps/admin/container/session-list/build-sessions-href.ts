import type { AdminSessionFilters } from '@/server/session/service'

const DEFAULT_SESSION_PAGE_SIZE = 10

export function buildSessionsHref(filters: AdminSessionFilters) {
  const searchParams = new URLSearchParams()

  if (filters.page !== 1) {
    searchParams.set('page', String(filters.page))
  }

  if (filters.pageSize !== DEFAULT_SESSION_PAGE_SIZE) {
    searchParams.set('pageSize', String(filters.pageSize))
  }

  if (filters.query) {
    searchParams.set('query', filters.query)
  }

  if (filters.userId) {
    searchParams.set('userId', filters.userId)
  }

  if (filters.userEmail) {
    searchParams.set('userEmail', filters.userEmail)
  }

  if (filters.userType !== 'all') {
    searchParams.set('userType', filters.userType)
  }

  if (filters.createdFrom) {
    searchParams.set('createdFrom', filters.createdFrom)
  }

  if (filters.createdTo) {
    searchParams.set('createdTo', filters.createdTo)
  }

  if (filters.updatedFrom) {
    searchParams.set('updatedFrom', filters.updatedFrom)
  }

  if (filters.updatedTo) {
    searchParams.set('updatedTo', filters.updatedTo)
  }

  if (filters.sortBy !== 'updatedAt') {
    searchParams.set('sortBy', filters.sortBy)
  }

  if (filters.sortOrder !== 'desc') {
    searchParams.set('sortOrder', filters.sortOrder)
  }

  const queryString = searchParams.toString()
  return queryString ? `/sessions?${queryString}` : '/sessions'
}
