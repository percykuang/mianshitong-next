import type {
  CreateSessionBody,
  InterruptMessageBody,
  UpdateMessageFeedbackBody,
  UpdateSessionBody,
} from '@/app/chat/contracts'
import type { ChatMessageFeedback, ChatSessionPreview } from '@/app/chat/domain'

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

export async function createPersistedChatSession({
  modelId,
  title,
}: CreateSessionBody) {
  const requestBody: CreateSessionBody = {
    modelId,
    title,
  }

  const response = await fetch('/api/chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  await ensureSuccessResponse(response)

  const responseBody = (await response.json()) as SessionResponse
  return responseBody.session
}

export async function updatePersistedChatSession(
  sessionId: string,
  input: UpdateSessionBody
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

export async function generatePersistedChatSessionTitle(sessionId: string) {
  const response = await fetch(`/api/chat/sessions/${sessionId}/title`, {
    method: 'POST',
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
  const requestBody: UpdateMessageFeedbackBody = {
    feedback,
  }

  const response = await fetch(
    `/api/chat/sessions/${sessionId}/messages/${messageId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  )

  await ensureSuccessResponse(response)

  const responseBody = (await response.json()) as SessionResponse
  return responseBody.session
}

export async function persistInterruptedChatReply(
  input: InterruptMessageBody & { sessionId: string }
) {
  const requestBody: InterruptMessageBody = {
    content: input.content,
    expectedMessageCount: input.expectedMessageCount,
  }

  const response = await fetch(
    `/api/chat/sessions/${input.sessionId}/messages/interrupted`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  )

  await ensureSuccessResponse(response)

  const responseBody = (await response.json()) as SessionResponse
  return responseBody.session
}
