import { redirect } from 'next/navigation'
import { AuthFormCard } from '@/components/auth/auth-form-card'
import { REGISTER_PAGE_COPY } from '@/components/auth/auth-copy'
import { getCurrentUser } from '@/server/auth-session'

export default async function RegisterPage() {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    redirect('/')
  }

  return <AuthFormCard copy={REGISTER_PAGE_COPY} mode="register" />
}
