import { NextResponse } from 'next/server'
import { getCurrentChatActor, type ChatActor } from '@/server/chat-actor'

interface JsonErrorPayload {
  error: string
}

type ChatActorResult =
  | {
      actor: ChatActor
      errorResponse: null
    }
  | {
      actor: null
      errorResponse: Response
    }

export function jsonError(message: string, status: number) {
  return NextResponse.json<JsonErrorPayload>({ error: message }, { status })
}

export async function parseJsonBody<T>(request: Request) {
  return (await request.json().catch(() => null)) as T | null
}

export async function resolveChatActor(): Promise<ChatActorResult> {
  const actor = await getCurrentChatActor({ createGuest: true })

  return actor
    ? { actor, errorResponse: null }
    : {
        actor: null,
        errorResponse: jsonError('无法初始化会话身份', 500),
      }
}
