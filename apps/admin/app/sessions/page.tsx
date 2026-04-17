import { SessionList } from '@/container'
import {
  listAdminSessions,
  parseAdminSessionFilters,
} from '@/server/session/service'

interface AdminSessionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SessionsPage({
  searchParams,
}: AdminSessionsPageProps) {
  const resolvedSearchParams = await searchParams
  const filters = parseAdminSessionFilters(resolvedSearchParams)
  const sessions = await listAdminSessions(filters)

  return <SessionList filters={filters} sessions={sessions} />
}
