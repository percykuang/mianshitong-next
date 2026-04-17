import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/server/auth/service'

export default async function AdminIndexPage() {
  const currentAdminUser = await getCurrentUserProfile()

  redirect(currentAdminUser ? '/users' : '/login')
}
