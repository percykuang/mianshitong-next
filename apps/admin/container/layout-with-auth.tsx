import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Layout } from './layout'
import { getCurrentUserProfile } from '@/server/auth/service'

export async function LayoutWithAuth({ children }: { children: ReactNode }) {
  const currentAdminUser = await getCurrentUserProfile()

  if (!currentAdminUser) {
    redirect('/login')
  }

  return <Layout userEmail={currentAdminUser.email}>{children}</Layout>
}

export default LayoutWithAuth
