import { parseJsonSafely } from '@mianshitong/shared/runtime'

interface LogoutErrorPayload {
  error?: string
}

async function parseLogoutError(response: Response) {
  const payload = await parseJsonSafely<LogoutErrorPayload>(response)

  return payload?.error ?? '退出失败，请稍后重试'
}

export async function logoutCurrentUser() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  if (response.ok) {
    return
  }

  throw new Error(await parseLogoutError(response))
}
