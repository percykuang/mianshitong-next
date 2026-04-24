import { buildPathWithSearchParams } from '@mianshitong/shared/runtime'

export function buildUsersHref(input: { page: number; pageSize: number }) {
  return buildPathWithSearchParams('/users', {
    page: String(input.page),
    pageSize: String(input.pageSize),
  })
}
