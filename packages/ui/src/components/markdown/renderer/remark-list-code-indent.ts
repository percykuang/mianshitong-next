// remark 插件，只处理“已经在列表项里的代码块”缩进，不负责修复错误的 Markdown 结构。
import { isDevelopmentEnv } from '../../../utils/env'

interface MarkdownAstNode {
  children?: MarkdownAstNode[]
  type?: string
  value?: string
}

function getLineIndentWidth(line: string) {
  return /^[\t ]*/.exec(line)?.[0].length ?? 0
}

function dedentCodeValue(value: string) {
  // 列表项中的 fenced code block 常常会带上一层列表缩进，这里只移除公共缩进。
  const normalizedValue = value.replace(/\r\n?/g, '\n')
  const lines = normalizedValue.split('\n')
  let commonIndent: number | null = null

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    const indent = getLineIndentWidth(line)

    if (indent === 0) {
      return value
    }

    commonIndent =
      commonIndent === null ? indent : Math.min(commonIndent, indent)
  }

  if (!commonIndent || commonIndent <= 0) {
    return value
  }

  return lines
    .map((line) => {
      if (!line.trim()) {
        return ''
      }

      const indent = getLineIndentWidth(line)
      return line.slice(Math.min(commonIndent, indent))
    })
    .join('\n')
}

function visitMarkdownTree(
  node: MarkdownAstNode,
  ancestors: MarkdownAstNode[],
  visitor: (node: MarkdownAstNode, ancestors: MarkdownAstNode[]) => void
) {
  visitor(node, ancestors)

  if (!Array.isArray(node.children) || node.children.length === 0) {
    return
  }

  for (const child of node.children) {
    visitMarkdownTree(child, [...ancestors, node], visitor)
  }
}

export function remarkNormalizeListCodeIndent() {
  return (tree: MarkdownAstNode) => {
    try {
      visitMarkdownTree(tree, [], (node, ancestors) => {
        if (node.type !== 'code' || typeof node.value !== 'string') {
          return
        }

        // 只在 code 已经被 remark 正确解析为 listItem 子节点时做缩进修正。
        const inListItem = ancestors.some(
          (ancestorNode) => ancestorNode.type === 'listItem'
        )

        if (!inListItem) {
          return
        }

        node.value = dedentCodeValue(node.value)
      })
    } catch (error) {
      if (isDevelopmentEnv()) {
        console.error(
          '[MarkdownRenderer] failed to normalize list code block indent',
          error
        )
      }
    }
  }
}
