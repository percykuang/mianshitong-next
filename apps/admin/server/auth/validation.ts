const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface CredentialsInput {
  email: string
  password: string
}

export interface ValidationResult {
  data?: CredentialsInput
  error?: string
}

export function validateCredentials(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return {
      error: '请求体格式不正确',
    }
  }

  const { email, password } = input as Partial<CredentialsInput>
  const normalizedEmail = email?.trim().toLowerCase()
  const normalizedPassword = typeof password === 'string' ? password : undefined

  if (!normalizedEmail || !EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      error: '请输入有效邮箱地址',
    }
  }

  if (!normalizedPassword || normalizedPassword.length < 8) {
    return {
      error: '密码至少 8 位',
    }
  }

  if (normalizedPassword.length > 16) {
    return {
      error: '密码长度不能超过 16 位',
    }
  }

  return {
    data: {
      email: normalizedEmail,
      password: normalizedPassword,
    },
  }
}
