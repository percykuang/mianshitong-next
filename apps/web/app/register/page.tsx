import { AuthFormCard } from '@/components/auth/auth-form-card'
import { REGISTER_PAGE_COPY } from '@/components/auth/auth-copy'

export default function RegisterPage() {
  return <AuthFormCard copy={REGISTER_PAGE_COPY} mode="register" />
}
