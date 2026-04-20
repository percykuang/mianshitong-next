import { redirect } from 'next/navigation'

import { LoginScreen } from '@/container'
import { getCurrentUserProfile } from '@/server/auth/service'
import { resolveRedirect } from '@/utils'

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentAdminUser = await getCurrentUserProfile()
  const resolvedSearchParams = await searchParams
  const nextPath = resolveRedirect(resolvedSearchParams.redirect)

  if (currentAdminUser) {
    redirect(nextPath)
  }

  return <LoginScreen redirectTo={nextPath} />
}
