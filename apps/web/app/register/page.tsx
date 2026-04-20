import { redirect } from 'next/navigation'
import { AuthFormCard, REGISTER_PAGE_COPY } from '@/components'
import { getCurrentAuthUserProfile } from '@/server/auth/services'
import { resolveAuthRedirect } from '@/utils/auth'

interface RegisterPageProps {
  searchParams: Promise<{
    redirect?: string | string[]
  }>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const currentUser = await getCurrentAuthUserProfile()
  const resolvedSearchParams = await searchParams

  if (currentUser) {
    redirect(resolveAuthRedirect(resolvedSearchParams.redirect))
  }

  return <AuthFormCard copy={REGISTER_PAGE_COPY} mode="register" />
}
