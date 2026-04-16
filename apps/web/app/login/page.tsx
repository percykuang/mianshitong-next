import { redirect } from 'next/navigation'
import { AuthFormCard, LOGIN_PAGE_COPY } from '@/components'
import { getCurrentAuthUserProfile } from '@/server/auth/services'
import { resolveAuthRedirect } from '@/utils/auth-redirect'

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const currentUser = await getCurrentAuthUserProfile()
  const resolvedSearchParams = await searchParams

  if (currentUser) {
    redirect(resolveAuthRedirect(resolvedSearchParams.redirect))
  }

  return <AuthFormCard copy={LOGIN_PAGE_COPY} mode="login" />
}
