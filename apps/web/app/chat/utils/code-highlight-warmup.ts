import { type ChatSessionPreview } from '@/components'
import { highlightCodeBlock, type ThemeMode } from '@mianshitong/ui'

interface MarkdownCodeFence {
  code: string
  language: string
}

interface WarmupOptions {
  maxBlocks?: number
  sessions: ChatSessionPreview[]
  shouldContinue?: () => boolean
  themeMode: ThemeMode
}

const DEFAULT_MAX_WARMUP_BLOCKS = 80
const OPENING_FENCE_PATTERN = /^\s*(`{3,}|~{3,})(.*)$/

function shouldStop(shouldContinue?: () => boolean) {
  return shouldContinue ? !shouldContinue() : false
}

function normalizeFenceLanguage(info: string) {
  const rawLanguage = info.trim().split(/\s+/)[0] ?? ''

  if (!rawLanguage) {
    return 'text'
  }

  return rawLanguage
    .replace(/^\{+/, '')
    .replace(/\}+$/, '')
    .replace(/^language-/, '')
    .trim()
    .toLowerCase()
}

export function extractMarkdownCodeFences(
  content: string
): MarkdownCodeFence[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const fences: MarkdownCodeFence[] = []
  let activeFenceMarker: '`' | '~' | null = null
  let activeFenceWidth = 0
  let activeFenceLanguage = 'text'
  let codeLines: string[] = []

  for (const line of lines) {
    if (!activeFenceMarker) {
      const openingMatch = OPENING_FENCE_PATTERN.exec(line)

      if (!openingMatch) {
        continue
      }

      activeFenceMarker = openingMatch[1][0] as '`' | '~'
      activeFenceWidth = openingMatch[1].length
      activeFenceLanguage = normalizeFenceLanguage(openingMatch[2] ?? '')
      codeLines = []
      continue
    }

    const closingFencePattern = new RegExp(
      `^\\s*${activeFenceMarker}{${activeFenceWidth},}\\s*$`
    )

    if (closingFencePattern.test(line)) {
      fences.push({
        code: codeLines.join('\n'),
        language: activeFenceLanguage,
      })
      activeFenceMarker = null
      activeFenceWidth = 0
      activeFenceLanguage = 'text'
      codeLines = []
      continue
    }

    codeLines.push(line)
  }

  return fences
}

export async function warmupCodeHighlightForSessions({
  maxBlocks = DEFAULT_MAX_WARMUP_BLOCKS,
  sessions,
  shouldContinue,
  themeMode,
}: WarmupOptions) {
  let warmedCount = 0
  const seenBlocks = new Set<string>()

  for (const session of sessions) {
    if (shouldStop(shouldContinue)) {
      return
    }

    for (const message of session.messages) {
      if (shouldStop(shouldContinue)) {
        return
      }

      if (message.role !== 'assistant') {
        continue
      }

      if (
        !message.content.includes('```') &&
        !message.content.includes('~~~')
      ) {
        continue
      }

      const codeFences = extractMarkdownCodeFences(message.content)

      for (const codeFence of codeFences) {
        if (shouldStop(shouldContinue)) {
          return
        }

        const code = codeFence.code

        if (!code.trim()) {
          continue
        }

        const dedupeKey = `${themeMode}\u0000${codeFence.language}\u0000${code}`

        if (seenBlocks.has(dedupeKey)) {
          continue
        }

        seenBlocks.add(dedupeKey)
        await highlightCodeBlock(code, codeFence.language, themeMode)
        warmedCount += 1

        if (warmedCount >= maxBlocks) {
          return
        }
      }
    }
  }
}
