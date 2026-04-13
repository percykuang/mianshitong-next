interface LogoutErrorPayload {
  error?: string
}

async function parseLogoutError(response: Response) {
  const payload = (await response
    .json()
    .catch(() => null)) as LogoutErrorPayload | null

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
