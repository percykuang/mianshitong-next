export type AuthFieldName = 'email' | 'password'

export interface AuthFieldError {
  field: AuthFieldName
  message: string
}

export function isAuthFieldError(value: unknown): value is AuthFieldError {
  if (!value || typeof value !== 'object') {
    return false
  }

  const field = 'field' in value ? value.field : undefined
  const message = 'message' in value ? value.message : undefined

  return (
    (field === 'email' || field === 'password') && typeof message === 'string'
  )
}
