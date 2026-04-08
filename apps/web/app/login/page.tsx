import { redirect } from 'next/navigation'
import { AuthFormCard } from '@/components/auth/auth-form-card'
import { LOGIN_PAGE_COPY } from '@/components/auth/auth-copy'
import { getCurrentUser } from '@/server/auth-session'

export default async function LoginPage() {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    redirect('/')
  }

  return <AuthFormCard copy={LOGIN_PAGE_COPY} mode="login" />
}
