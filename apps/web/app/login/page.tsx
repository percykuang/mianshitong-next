import { AuthFormCard } from '@/components/auth/auth-form-card'
import { LOGIN_PAGE_COPY } from '@/components/auth/auth-copy'

export default function LoginPage() {
  return <AuthFormCard copy={LOGIN_PAGE_COPY} mode="login" />
}
