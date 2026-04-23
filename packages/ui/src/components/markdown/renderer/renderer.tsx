'use client'

import { createLogger } from '@mianshitong/shared'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { isDevelopmentEnv } from '../../../utils/env'
import { markdownElements } from './elements'
import { remarkNormalizeListCodeIndent } from './remark-list-code-indent'
import { normalizeMarkdownContent } from './utils'

const logger = createLogger('MarkdownRenderer')

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
  const safeContent =
    typeof content === 'string' ? content : String(content ?? '')
  let normalizedContent = safeContent

  try {
    // 流式输出时，模型可能刚输出 ``` 或 ~~~ 就暂停。
    // 渲染前临时补上闭合围栏，能让 react-markdown 保持稳定渲染。
    normalizedContent = normalizeMarkdownContent(safeContent, {
      completeUnclosedFence: streaming,
    })
  } catch (error) {
    if (isDevelopmentEnv()) {
      logger.error('failed before markdown render', error)
    }
  }

  return (
    <div className="min-w-0 text-sm leading-6 text-(--mst-color-text-primary) select-text [&>:first-child]:mt-0">
      <Markdown
        components={markdownElements}
        // GFM 用于支持表格、任务列表、删除线、自动链接等扩展语法。
        // 自定义插件只做低风险的列表代码缩进去除，不再重写 Markdown 结构。
        remarkPlugins={[remarkGfm, remarkNormalizeListCodeIndent]}
      >
        {normalizedContent}
      </Markdown>
    </div>
  )
}
