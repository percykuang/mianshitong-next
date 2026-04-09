import {
  getChatModel,
  getChatModelRuntimeInfo,
  isChatModelId,
  normalizeChatModelId,
} from '@mianshitong/providers'
import { NextResponse } from 'next/server'

interface ChatRequestMessage {
  role: 'assistant' | 'user'
  content: string
}

interface ChatRequestBody {
  history?: ChatRequestMessage[]
  message?: string
  modelId?: string
}

const SYSTEM_PROMPT = `你是面试通的 AI 面试助手。

你的任务是围绕求职、面试、简历优化、项目表达、技术追问这些主题，给出清晰、具体、可执行的中文回答。

回答要求：
1. 默认使用简体中文。
2. 优先直接回答问题，再给结构化建议。
3. 如果用户的问题适合列表化表达，可以自然使用 Markdown。
4. 不要编造不存在的经历、项目或数据；如果信息不足，明确指出并引导用户补充。
5. 输出尽量适合聊天场景，避免过度冗长。`

function normalizeContent(
  content:
    | string
    | Array<string | { text?: string; type?: string }>
    | null
    | undefined
) {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (typeof part?.text === 'string') {
        return part.text
      }

      return ''
    })
    .join('')
    .trim()
}

function normalizeChunkText(
  chunk:
    | {
        content?:
          | string
          | Array<string | { text?: string; type?: string }>
          | null
          | undefined
        text?: string
      }
    | null
    | undefined
) {
  const normalizedContent = normalizeContent(chunk?.content)

  if (normalizedContent) {
    return normalizedContent
  }

  return typeof chunk?.text === 'string' ? chunk.text : ''
}

function sanitizeHistory(history: ChatRequestMessage[] | undefined) {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter(
      (message): message is ChatRequestMessage =>
        (message.role === 'assistant' || message.role === 'user') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
}

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as ChatRequestBody | null

  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  const history = sanitizeHistory(body?.history)
  const conversation =
    history.at(-1)?.role === 'user' && history.at(-1)?.content === message
      ? history
      : [...history, { role: 'user' as const, content: message }]

  if (!message) {
    return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
  }

  try {
    if (
      typeof body?.modelId === 'string' &&
      body.modelId.trim().length > 0 &&
      !isChatModelId(body.modelId)
    ) {
      return NextResponse.json({ error: '不支持的模型类型' }, { status: 400 })
    }

    const normalizedModelId = normalizeChatModelId(body?.modelId)
    const model = getChatModel(normalizedModelId)
    const runtime = getChatModelRuntimeInfo(normalizedModelId)
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const outputStream = await model.stream([
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            ...conversation,
          ])

          for await (const chunk of outputStream) {
            if (request.signal.aborted) {
              controller.close()
              return
            }

            const text = normalizeChunkText(chunk)

            if (!text) {
              continue
            }

            controller.enqueue(encoder.encode(text))
          }

          controller.close()
        } catch (error) {
          console.error('[api/chat] model stream failed', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'x-mst-chat-actual-model': encodeURIComponent(runtime.actualModel),
        'x-mst-chat-display-target': encodeURIComponent(runtime.displayTarget),
        'x-mst-chat-mode': runtime.mode,
        'x-mst-chat-provider': runtime.provider,
        'x-mst-chat-requested-model-id': runtime.requestedModelId,
      },
    })
  } catch (error) {
    console.error('[api/chat] model invoke failed', error)

    return NextResponse.json(
      { error: 'AI 服务暂时不可用，请稍后再试' },
      { status: 500 }
    )
  }
}
