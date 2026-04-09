import { redirect } from 'next/navigation'
import { AuthFormCard, REGISTER_PAGE_COPY } from '@/components'
import { getCurrentUser } from '@/server/auth-session'

export default async function RegisterPage() {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    redirect('/')
  }

  return <AuthFormCard copy={REGISTER_PAGE_COPY} mode="register" />
}
