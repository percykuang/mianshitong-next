'use client'

import { Children, isValidElement, type ComponentPropsWithoutRef } from 'react'
import type { Components, ExtraProps } from 'react-markdown'
import {
  CodeBlock,
  renderInlineCode,
  type MarkdownCodeProps,
} from '../code-block'
import {
  containsBlockChild,
  getMarkdownTableColumnCount,
  hasClassName,
  sanitizeMarkdownElementProps,
} from './utils'

// 元素渲染层。各级标题、段落、列表、表格、引用块等样式主要都在这里控制。

type CodeComponentProps = ComponentPropsWithoutRef<'code'> &
  ExtraProps &
  MarkdownCodeProps

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const markdownTextClassName = 'text-(--mst-color-text-primary)'
const markdownBlockSpacingClassName = 'not-first:mt-3'
const markdownBodyClassName = `leading-6 ${markdownTextClassName} ${markdownBlockSpacingClassName}`

const headingSizeClassNames: Record<HeadingTag, string> = {
  h1: 'text-3xl',
  h2: 'text-2xl',
  h3: 'text-xl',
  h4: 'text-lg',
  h5: 'text-base',
  h6: 'text-sm',
}

function renderHeading(
  tag: HeadingTag,
  { children, ...props }: ComponentPropsWithoutRef<HeadingTag> & ExtraProps
) {
  const elementProps = sanitizeMarkdownElementProps(props)
  const Tag = tag

  return (
    <Tag
      className={`mt-6 mb-2 font-semibold leading-tight ${markdownTextClassName} ${headingSizeClassNames[tag]}`}
      {...elementProps}
    >
      {children}
    </Tag>
  )
}

export const markdownElements: Components = {
  // 标题
  h1({ children, ...props }) {
    return renderHeading('h1', { children, ...props })
  },
  h2({ children, ...props }) {
    return renderHeading('h2', { children, ...props })
  },
  h3({ children, ...props }) {
    return renderHeading('h3', { children, ...props })
  },
  h4({ children, ...props }) {
    return renderHeading('h4', { children, ...props })
  },
  h5({ children, ...props }) {
    return renderHeading('h5', { children, ...props })
  },
  h6({ children, ...props }) {
    return renderHeading('h6', { children, ...props })
  },

  // 文本与链接
  p({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    if (containsBlockChild(children)) {
      // 避免生成 <p><pre>...</pre></p> 这类非法 HTML 结构。
      return (
        <div className={markdownBodyClassName} {...elementProps}>
          {children}
        </div>
      )
    }

    return (
      <p className={markdownBodyClassName} {...elementProps}>
        {children}
      </p>
    )
  },
  a({ children, href, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)
    const isExternalLink = Boolean(
      href?.match(/^(https?:)?\/\//) || href?.startsWith('mailto:')
    )

    return (
      <a
        className="font-medium text-(--mst-color-primary) underline underline-offset-4 transition-colors hover:text-sky-700 dark:hover:text-sky-300"
        href={href}
        rel={isExternalLink ? 'noreferrer noopener' : undefined}
        target={isExternalLink ? '_blank' : undefined}
        {...elementProps}
      >
        {children}
      </a>
    )
  },

  // 列表
  ul({ children, className, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)
    const isTaskList = hasClassName(className, 'contains-task-list')

    return (
      <ul
        className={
          isTaskList
            ? `space-y-1.5 pl-0 ${markdownBodyClassName}`
            : `list-disc space-y-2 pl-6 ${markdownBodyClassName} marker:text-(--mst-color-primary)`
        }
        data-task-list={isTaskList ? 'true' : undefined}
        {...elementProps}
      >
        {children}
      </ul>
    )
  },
  ol({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <ol
        className={`list-decimal space-y-2 pl-6 ${markdownBodyClassName} marker:font-semibold marker:text-(--mst-color-primary)`}
        {...elementProps}
      >
        {children}
      </ol>
    )
  },
  li({ children, className, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)
    const isTaskListItem = hasClassName(className, 'task-list-item')

    return (
      <li
        className={
          isTaskListItem
            ? 'flex items-center gap-2.5 rounded-xl px-0 py-0.5 text-(--mst-color-text-primary)'
            : 'pl-1 text-(--mst-color-text-primary)'
        }
        {...elementProps}
      >
        {children}
      </li>
    )
  },

  // 引用与分隔线
  blockquote({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <blockquote
        className="border-l-[3px] border-(--mst-color-primary) bg-slate-900/4 py-0.5 pr-4 pl-4 text-(--mst-color-text-secondary) italic not-first:mt-4 dark:bg-white/6"
        {...elementProps}
      >
        {children}
      </blockquote>
    )
  },
  hr(props) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <hr
        className="my-6 border-0 border-t border-(--mst-color-border-default)"
        {...elementProps}
      />
    )
  },

  // 代码
  pre({ children }) {
    // react-markdown 会把围栏代码渲染为 <pre><code>，这里解包成统一的 CodeBlock。
    const childNodes = Children.toArray(children)
    const firstChild = childNodes[0]

    if (
      isValidElement<CodeComponentProps>(firstChild) &&
      (firstChild.type === 'code' || firstChild.props.node?.tagName === 'code')
    ) {
      const {
        children: codeChildren,
        className,
        ...codeProps
      } = firstChild.props

      return (
        <CodeBlock className={className} {...codeProps}>
          {codeChildren}
        </CodeBlock>
      )
    }

    return <pre>{children}</pre>
  },
  code(props) {
    return renderInlineCode(sanitizeMarkdownElementProps(props))
  },

  // 表格
  table({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)
    const columnCount = getMarkdownTableColumnCount(children)
    // 两列 Markdown 表格通常是 key/value 内容，因此默认按 50/50 分列。
    const isTwoColumnTable = columnCount === 2

    return (
      <div
        className="my-4 overflow-hidden border border-(--mst-color-border-default)"
        data-markdown="table-wrapper"
      >
        <div className="overflow-x-auto">
          <table
            className={`w-full border-collapse text-left ${
              isTwoColumnTable ? 'table-fixed' : 'table-auto'
            }`}
            data-columns={columnCount ?? undefined}
            {...elementProps}
          >
            {isTwoColumnTable ? (
              <colgroup>
                <col style={{ width: '50%' }} />
                <col style={{ width: '50%' }} />
              </colgroup>
            ) : null}
            {children}
          </table>
        </div>
      </div>
    )
  },
  thead({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <thead className="bg-slate-900/4 dark:bg-white/6" {...elementProps}>
        {children}
      </thead>
    )
  },
  tbody({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <tbody
        className="divide-y divide-(--mst-color-border-default)"
        {...elementProps}
      >
        {children}
      </tbody>
    )
  },
  tr({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <tr className="align-top" {...elementProps}>
        {children}
      </tr>
    )
  },
  th({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <th
        className="px-4 py-2 text-left text-sm leading-5 font-semibold wrap-break-word"
        {...elementProps}
      >
        {children}
      </th>
    )
  },
  td({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <td
        className="px-4 py-2 text-sm leading-6 wrap-break-word"
        {...elementProps}
      >
        {children}
      </td>
    )
  },
  input({ checked, className, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <input
        checked={checked}
        className={`mr-0 size-3.5 shrink-0 rounded-sm border border-(--mst-color-border-default) accent-(--mst-color-primary) ${className ?? ''}`.trim()}
        disabled
        type="checkbox"
        {...elementProps}
      />
    )
  },
}
