import type { ReactNode } from 'react'

import { redirect } from 'next/navigation'

import { getCurrentAuthUserProfile } from '@/server'

import { Layout } from './layout'

export async function LayoutWithAuth({ children }: { children: ReactNode }) {
  const currentAdminUser = await getCurrentAuthUserProfile()

  if (!currentAdminUser) {
    redirect('/login')
  }

  return <Layout userEmail={currentAdminUser.email}>{children}</Layout>
}

export default LayoutWithAuth
