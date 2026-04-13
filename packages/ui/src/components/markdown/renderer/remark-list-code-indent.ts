// remark 插件，主要影响列表中的代码块内容格式，不是样式层。

interface MarkdownAstNode {
  type?: string
  value?: string
  children?: MarkdownAstNode[]
}

function getLineIndentWidth(line: string) {
  return /^[\t ]*/.exec(line)?.[0].length ?? 0
}

function dedentCodeValue(value: string) {
  // 列表项里的代码块通常会带上列表缩进，这里移除公共缩进。
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
      const removeWidth = Math.min(commonIndent, indent)
      return line.slice(removeWidth)
    })
    .join('\n')
}

function visitMarkdownTree(
  node: MarkdownAstNode,
  ancestors: MarkdownAstNode[],
  visitor: (node: MarkdownAstNode, ancestors: MarkdownAstNode[]) => void
) {
  visitor(node, ancestors)

  if (!Array.isArray(node.children)) {
    return
  }

  for (const child of node.children) {
    visitMarkdownTree(child, [...ancestors, node], visitor)
  }
}

export function remarkNormalizeListCodeIndent() {
  // 让列表项里的代码块视觉上和普通围栏代码块保持对齐。
  return (tree: MarkdownAstNode) => {
    visitMarkdownTree(tree, [], (node, ancestors) => {
      if (node.type !== 'code' || typeof node.value !== 'string') {
        return
      }

      const inListItem = ancestors.some(
        (ancestorNode) => ancestorNode.type === 'listItem'
      )

      if (!inListItem) {
        return
      }

      node.value = dedentCodeValue(node.value)
    })
  }
}
