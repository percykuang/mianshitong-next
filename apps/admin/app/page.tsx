import { redirect } from 'next/navigation'

import { getCurrentAuthUserProfile } from '@/server'

export default async function AdminIndexPage() {
  const currentAdminUser = await getCurrentAuthUserProfile()

  redirect(currentAdminUser ? '/users' : '/login')
}
