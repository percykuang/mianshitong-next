import { listAdminUsers, parseAdminUserListQuery } from '@/server/user/service'
import { UserList } from '@/container'

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function UsersPage({ searchParams }: AdminUsersPageProps) {
  const query = parseAdminUserListQuery(await searchParams)
  const users = await listAdminUsers(query)

  return <UserList users={users} />
}
