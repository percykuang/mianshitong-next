import type { ReactNode } from 'react'

import { redirect } from 'next/navigation'

import { getCurrentUserProfile } from '@/server/auth/service'

import { Layout } from './layout'

export async function LayoutWithAuth({ children }: { children: ReactNode }) {
  const currentAdminUser = await getCurrentUserProfile()

  if (!currentAdminUser) {
    redirect('/login')
  }

  return <Layout userEmail={currentAdminUser.email}>{children}</Layout>
}

export default LayoutWithAuth
