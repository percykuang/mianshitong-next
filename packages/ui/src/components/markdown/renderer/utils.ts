import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { CodeBlock } from '../code-block'

// 一些结构判断和内容预处理，不直接定义大部分视觉样式，但会影响最终怎么渲染。

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
  // 统一换行符，并把紧贴正文的代码围栏拆到新行，降低 Markdown 解析歧义。
  const normalized = content
    .replace(/\r\n?/g, '\n')
    .replace(/([^\n])((?:```|~~~)[^\n]*)(?=\n)/g, '$1\n\n$2')

  const lines = normalized.split('\n')
  const nextLines: string[] = []
  let activeFenceMarker: '`' | '~' | null = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmedLine = line.trim()
    const fenceMatch = /^(```+|~~~+)/.exec(trimmedLine)

    if (fenceMatch) {
      const marker = fenceMatch[1][0] as '`' | '~'

      if (!activeFenceMarker) {
        if (nextLines.length > 0 && nextLines[nextLines.length - 1].trim()) {
          nextLines.push('')
        }

        activeFenceMarker = marker
        nextLines.push(line)
        continue
      }

      if (activeFenceMarker === marker) {
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

    nextLines.push(activeFenceMarker.repeat(3))
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
