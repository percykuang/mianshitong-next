import {
  type AuthFieldError,
  validateRegistrationEmail,
  validateRegistrationPassword,
} from '@/utils/auth'

export interface CredentialsInput {
  email: string
  password: string
}

export interface ValidationResult {
  data?: CredentialsInput
  error?: string | AuthFieldError
}

function parseCredentialsInput(input: unknown): ValidationResult {
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

export function validateLoginCredentials(input: unknown): ValidationResult {
  return parseCredentialsInput(input)
}

export function validateRegistrationCredentials(
  input: unknown
): ValidationResult {
  const parsed = parseCredentialsInput(input)

  if (!parsed.data) {
    return parsed
  }

  const { email: normalizedEmail, password: normalizedPassword } = parsed.data

  const emailError = validateRegistrationEmail(normalizedEmail)

  if (emailError) {
    return {
      error: {
        field: 'email',
        message: emailError,
      },
    }
  }

  const passwordError = validateRegistrationPassword(normalizedPassword)

  if (passwordError) {
    return {
      error: {
        field: 'password',
        message: passwordError,
      },
    }
  }

  return {
    data: {
      email: normalizedEmail,
      password: normalizedPassword,
    },
  }
}
