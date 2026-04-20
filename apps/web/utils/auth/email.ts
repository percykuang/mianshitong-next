const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegistrationEmail(email: string | undefined) {
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
    return '请输入有效邮箱地址'
  }

  return null
}
