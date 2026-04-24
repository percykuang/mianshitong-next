import { redirect } from 'next/navigation'

import { LoginScreen } from '@/container'
import { getCurrentAuthUserProfile } from '@/server'
import { resolveRedirect } from '@/utils'

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentAdminUser = await getCurrentAuthUserProfile()
  const resolvedSearchParams = await searchParams
  const nextPath = resolveRedirect(resolvedSearchParams.redirect)

  if (currentAdminUser) {
    redirect(nextPath)
  }

  return <LoginScreen redirectTo={nextPath} />
}
