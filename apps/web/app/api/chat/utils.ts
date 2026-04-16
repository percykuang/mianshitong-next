import { parseJsonSafely } from '@mianshitong/shared'
import { NextResponse } from 'next/server'
import { getCurrentChatActor, type ChatActor } from '@/server/chat/actor'

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

type ParsedBodyResult<T> =
  | {
      data: T
      errorResponse: null
    }
  | {
      data: null
      errorResponse: Response
    }

export function jsonError(message: string, status: number) {
  return NextResponse.json<JsonErrorPayload>({ error: message }, { status })
}

export async function parseJsonBody<T>(request: Request) {
  return parseJsonSafely<T>(request)
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

export async function withChatActor(
  handler: (actor: ChatActor) => Promise<Response>
) {
  const { actor, errorResponse } = await resolveChatActor()

  if (!actor) {
    return errorResponse
  }

  return handler(actor)
}

export async function parseJsonBodyOrError<TBody, TData>(
  request: Request,
  parser: (body: TBody | null) => ParsedBodyResult<TData>
): Promise<ParsedBodyResult<TData>> {
  const body = await parseJsonBody<TBody>(request)
  return parser(body)
}
