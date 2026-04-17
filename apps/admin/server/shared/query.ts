export type SortOrder = 'asc' | 'desc'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  }).format(date)
}

function normalizeOptionalString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return (value[0] ?? '').trim()
  }

  return (value ?? '').trim()
}

export function normalizeDateInput(value: string | string[] | undefined) {
  const normalized = normalizeOptionalString(value)
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : ''
}

export function normalizePositiveInteger(
  value: string | string[] | undefined,
  fallback: number
) {
  const normalized = Number.parseInt(normalizeOptionalString(value), 10)

  if (!Number.isInteger(normalized) || normalized <= 0) {
    return fallback
  }

  return normalized
}

export function normalizePageSize(
  value: string | string[] | undefined,
  fallback = DEFAULT_PAGE_SIZE
) {
  return Math.min(normalizePositiveInteger(value, fallback), MAX_PAGE_SIZE)
}

export function createPagination(input: {
  page: number
  pageSize: number
  total: number
}): Pagination {
  return {
    page: input.page,
    pageSize: input.pageSize,
    total: input.total,
    totalPages: Math.max(1, Math.ceil(input.total / input.pageSize)),
  }
}

export function createPaginatedQuery(input: {
  page: number
  pageSize: number
}) {
  return {
    skip: (input.page - 1) * input.pageSize,
    take: input.pageSize,
  }
}

function createDateAtStart(dateText: string) {
  return new Date(`${dateText}T00:00:00`)
}

function createDateAtNextDay(dateText: string) {
  const nextDate = createDateAtStart(dateText)
  nextDate.setDate(nextDate.getDate() + 1)
  return nextDate
}

export function buildDateRangeWhere(input: { from: string; to: string }) {
  const where: {
    gte?: Date
    lt?: Date
  } = {}

  if (input.from) {
    where.gte = createDateAtStart(input.from)
  }

  if (input.to) {
    where.lt = createDateAtNextDay(input.to)
  }

  return Object.keys(where).length > 0 ? where : undefined
}

export function parsePage(
  value: string | string[] | undefined,
  fallback = DEFAULT_PAGE
) {
  return normalizePositiveInteger(value, fallback)
}

export function parseSearchText(value: string | string[] | undefined) {
  return normalizeOptionalString(value)
}
