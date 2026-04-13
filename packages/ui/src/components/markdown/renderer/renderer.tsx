'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkNormalizeListCodeIndent } from './remark-list-code-indent'
import { markdownElements } from './elements'
import { normalizeMarkdownContent } from './utils'

// 入口层。负责把内容喂给 react-markdown，并挂上插件和样式。

export interface MarkdownRendererProps {
  content: string
  /** 当前 Markdown 是否仍在流式输出，可能包含未闭合的代码围栏。 */
  streaming?: boolean
}

export function MarkdownRenderer({
  content,
  streaming = false,
}: MarkdownRendererProps) {
  // 流式输出时，模型可能刚输出 ``` 或 ~~~ 就暂停。
  // 渲染前临时补上闭合围栏，能让 react-markdown 保持稳定渲染。
  const normalizedContent = normalizeMarkdownContent(content, {
    completeUnclosedFence: streaming,
  })

  return (
    <div className="min-w-0 text-sm leading-6 text-(--mst-color-text-primary) select-text [&>:first-child]:mt-0">
      <Markdown
        components={markdownElements}
        // GFM 用于支持表格、任务列表、删除线、自动链接等扩展语法。
        remarkPlugins={[remarkGfm, remarkNormalizeListCodeIndent]}
      >
        {normalizedContent}
      </Markdown>
    </div>
  )
}
