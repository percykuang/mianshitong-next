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

  if (
    typeof normalizedEmail !== 'string' ||
    typeof normalizedPassword !== 'string'
  ) {
    return {
      error: '请求体格式不正确',
    }
  }

  return {
    data: {
      email: normalizedEmail,
      password: normalizedPassword,
    },
  }
}
