import type {
  ChatMessageFeedback,
  ChatModelId,
  ChatSessionPreview,
} from '@/components'

interface SessionResponse {
  session: ChatSessionPreview
}

interface SessionsResponse {
  sessions: ChatSessionPreview[]
}

interface DeleteAllSessionsResponse {
  deletedCount?: number
}

interface ApiErrorPayload {
  error?: string
}

async function parseApiError(response: Response) {
  const payload = (await response
    .json()
    .catch(() => null)) as ApiErrorPayload | null

  return payload?.error ?? '请求失败，请稍后再试'
}

async function ensureSuccessResponse(response: Response) {
  if (response.ok) {
    return
  }

  throw new Error(await parseApiError(response))
}

export async function listPersistedChatSessions() {
  const response = await fetch('/api/chat/sessions', {
    method: 'GET',
    cache: 'no-store',
  })

  await ensureSuccessResponse(response)

  const payload = (await response.json()) as SessionsResponse
  return payload.sessions
}

export async function getPersistedChatSession(sessionId: string) {
  const response = await fetch(`/api/chat/sessions/${sessionId}`, {
    method: 'GET',
    cache: 'no-store',
  })

  await ensureSuccessResponse(response)

  const payload = (await response.json()) as SessionResponse
  return payload.session
}

interface CreatePersistedSessionInput {
  modelId: ChatModelId
  title: string
}

export async function createPersistedChatSession({
  modelId,
  title,
}: CreatePersistedSessionInput) {
  const response = await fetch('/api/chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelId,
      title,
    }),
  })

  await ensureSuccessResponse(response)

  const payload = (await response.json()) as SessionResponse
  return payload.session
}

interface UpdatePersistedSessionInput {
  pinned?: boolean
  title?: string
}

export async function updatePersistedChatSession(
  sessionId: string,
  input: UpdatePersistedSessionInput
) {
  const response = await fetch(`/api/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  await ensureSuccessResponse(response)

  const payload = (await response.json()) as SessionResponse
  return payload.session
}

export async function deletePersistedChatSession(sessionId: string) {
  const response = await fetch(`/api/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  })

  await ensureSuccessResponse(response)
}

export async function deleteAllPersistedChatSessions() {
  const response = await fetch('/api/chat/sessions', {
    method: 'DELETE',
  })

  await ensureSuccessResponse(response)

  const payload = (await response
    .json()
    .catch(() => null)) as DeleteAllSessionsResponse | null

  return payload?.deletedCount ?? 0
}

export async function updatePersistedChatMessageFeedback(
  sessionId: string,
  messageId: string,
  feedback: ChatMessageFeedback | null
) {
  const response = await fetch(
    `/api/chat/sessions/${sessionId}/messages/${messageId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    }
  )

  await ensureSuccessResponse(response)

  const payload = (await response.json()) as SessionResponse
  return payload.session
}

interface PersistInterruptedReplyInput {
  content: string
  expectedMessageCount: number
  sessionId: string
}

export async function persistInterruptedChatReply(
  input: PersistInterruptedReplyInput
) {
  const response = await fetch(
    `/api/chat/sessions/${input.sessionId}/messages/interrupted`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: input.content,
        expectedMessageCount: input.expectedMessageCount,
      }),
    }
  )

  await ensureSuccessResponse(response)

  const payload = (await response.json()) as SessionResponse
  return payload.session
}
