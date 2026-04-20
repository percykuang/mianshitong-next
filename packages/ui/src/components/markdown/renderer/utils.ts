import {
  Children,
  type ReactElement,
  type ReactNode,
  isValidElement,
} from 'react'

import { isDevelopmentEnv } from '../../../utils/env'
import { CodeBlock } from '../code-block'

// 一些结构判断和内容预处理，不直接定义大部分视觉样式，但会影响最终怎么渲染。

// 有些模型会把整段 Markdown 再包进 ```markdown ... ```，
// 这里先识别这种 wrapper，再决定是否安全展开。
const COMPLETE_FENCE_PATTERN = /^```([\w-]*)\n([\s\S]*?)\n```$/
const MARKDOWN_WRAPPER_LANGUAGES = new Set(['markdown', 'md'])
const MARKDOWN_CONTENT_PATTERN =
  /(^|\n)(?:```[\w-]*\s*$|#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\|.+\|)/m
const FENCE_START_PATTERN = /^(```+|~~~+)([\w-]*)?[ \t]*$/
const FENCE_END_PATTERN = /^(```+|~~~+)[ \t]*$/
const MAX_MARKDOWN_WRAPPER_DEPTH = 3

function coerceMarkdownContent(content: string) {
  return typeof content === 'string' ? content : String(content ?? '')
}

export function sanitizeMarkdownElementProps<T extends { node?: unknown }>(
  props: T
) {
  // react-markdown 会传入底层 hast node，这个属性不应该继续透传到 DOM。
  const nextProps = { ...props }
  delete nextProps.node
  return nextProps
}

export function hasClassName(
  value: string | undefined,
  expectedClassName: string
) {
  return value?.split(/\s+/).includes(expectedClassName) ?? false
}

export function containsBlockChild(children: ReactNode) {
  // 段落里如果包含块级元素，就不能安全地继续渲染成 <p>。
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) {
      return false
    }

    if (child.type === CodeBlock) {
      return true
    }

    return typeof child.type === 'string'
      ? ['blockquote', 'div', 'hr', 'ol', 'pre', 'table', 'ul'].includes(
          child.type
        )
      : false
  })
}

export function normalizeMarkdownContent(
  content: string,
  { completeUnclosedFence = false }: { completeUnclosedFence?: boolean } = {}
) {
  try {
    const safeContent = coerceMarkdownContent(content)

    // 统一换行符，并优先展开多包一层的 markdown wrapper，
    // 避免把本应渲染成正文的内容误当成单个代码块。
    const normalized = unwrapMarkdownFenceWrappers(
      safeContent.replace(/\r\n?/g, '\n')
    )

    const lines = normalized.split('\n')
    const nextLines: string[] = []
    let activeFenceMarker: string | null = null

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      const trimmedLine = line.trim()
      const fenceMatch = FENCE_START_PATTERN.exec(trimmedLine)

      if (fenceMatch) {
        const marker = fenceMatch[1]

        if (!activeFenceMarker) {
          if (nextLines.length > 0 && nextLines[nextLines.length - 1].trim()) {
            nextLines.push('')
          }

          activeFenceMarker = marker
          nextLines.push(line)
          continue
        }

        if (isClosingFenceFor(activeFenceMarker, trimmedLine)) {
          nextLines.push(line)
          activeFenceMarker = null

          const nextLine = lines[index + 1]
          if (typeof nextLine === 'string' && nextLine.trim()) {
            nextLines.push('')
          }

          continue
        }
      }

      nextLines.push(line)
    }

    if (completeUnclosedFence && activeFenceMarker) {
      // 流式响应可能停在未闭合代码围栏中间；这里只为渲染临时补齐。
      if (nextLines.length > 0 && nextLines[nextLines.length - 1].trim()) {
        nextLines.push('')
      }

      nextLines.push(
        activeFenceMarker[0].repeat(Math.max(3, activeFenceMarker.length))
      )
    }

    const normalizedText = nextLines.join('\n')

    return completeUnclosedFence
      ? normalizedText
      : removeEmptyFencedCodeBlocks(normalizedText)
  } catch (error) {
    if (isDevelopmentEnv()) {
      console.error(
        '[MarkdownRenderer] failed to normalize markdown content',
        error
      )
    }

    return coerceMarkdownContent(content).replace(/\r\n?/g, '\n')
  }
}

function isClosingFenceFor(openingFence: string, line: string) {
  const closingFenceMatch = FENCE_END_PATTERN.exec(line)

  return Boolean(
    closingFenceMatch &&
    closingFenceMatch[1][0] === openingFence[0] &&
    closingFenceMatch[1].length >= openingFence.length
  )
}

function unwrapMarkdownFenceWrappers(content: string) {
  let nextContent = content

  for (let depth = 0; depth < MAX_MARKDOWN_WRAPPER_DEPTH; depth += 1) {
    const unwrapped = unwrapSingleMarkdownFenceWrapper(nextContent)

    if (unwrapped === nextContent) {
      return nextContent
    }

    nextContent = unwrapped
  }

  return nextContent
}

function unwrapSingleMarkdownFenceWrapper(content: string) {
  const trimmed = content.trim()

  if (!trimmed) {
    return trimmed
  }

  const match = COMPLETE_FENCE_PATTERN.exec(trimmed)

  if (!match) {
    return trimmed
  }

  const language = match[1].toLowerCase()

  if (!MARKDOWN_WRAPPER_LANGUAGES.has(language)) {
    return trimmed
  }

  const innerContent = match[2].trim()

  if (!innerContent) {
    return ''
  }

  // 只在内部内容看起来确实还是 Markdown 结构时才展开，
  // 避免把普通文本误判成需要“拆开”的代码块。
  if (
    !MARKDOWN_CONTENT_PATTERN.test(innerContent) &&
    !/`[^`]+`/.test(innerContent)
  ) {
    return trimmed
  }

  return innerContent
}

function removeEmptyFencedCodeBlocks(content: string) {
  const lines = content.split('\n')
  const nextLines: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index]
    const fenceMatch = FENCE_START_PATTERN.exec(currentLine.trim())

    if (!fenceMatch) {
      nextLines.push(currentLine)
      continue
    }

    const fenceMarker = fenceMatch[1]
    const fenceCharacter = fenceMarker[0]
    let endIndex = index + 1

    while (endIndex < lines.length) {
      const closingFenceMatch = FENCE_END_PATTERN.exec(lines[endIndex].trim())

      if (
        closingFenceMatch &&
        closingFenceMatch[1][0] === fenceCharacter &&
        closingFenceMatch[1].length >= fenceMarker.length
      ) {
        break
      }

      endIndex += 1
    }

    if (endIndex >= lines.length) {
      nextLines.push(currentLine)
      continue
    }

    const blockBody = lines.slice(index + 1, endIndex).join('\n')

    if (blockBody.trim()) {
      nextLines.push(...lines.slice(index, endIndex + 1))
    } else {
      // 删除真正空的代码块，避免模型偶发输出一个没有正文的 fenced block。
      while (nextLines.length > 0 && !nextLines[nextLines.length - 1].trim()) {
        nextLines.pop()
      }
    }

    index = endIndex
  }

  return nextLines.join('\n')
}

export function getMarkdownTableColumnCount(children: ReactNode) {
  // 这里拿到的是 react-markdown 渲染后的 table children，因此从首行反推列数。
  const sections = Children.toArray(children)

  for (const section of sections) {
    if (
      !isValidElement<{ children?: ReactNode }>(section) ||
      typeof section.type !== 'string' ||
      !['thead', 'tbody'].includes(section.type)
    ) {
      continue
    }

    const rows = Children.toArray(section.props.children)
    const firstRow = rows.find(
      (row): row is ReactElement<{ children?: ReactNode }> =>
        isValidElement<{ children?: ReactNode }>(row) && row.type === 'tr'
    )

    if (!firstRow) {
      continue
    }

    const columnCount = Children.toArray(firstRow.props.children).filter(
      (cell) =>
        isValidElement(cell) &&
        typeof cell.type === 'string' &&
        ['th', 'td'].includes(cell.type)
    ).length

    if (columnCount > 0) {
      return columnCount
    }
  }

  return null
}
