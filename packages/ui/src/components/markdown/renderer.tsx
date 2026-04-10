'use client'

import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import Markdown, { type Components } from 'react-markdown'
import { type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  CodeBlock,
  CodeBlockStyles,
  renderInlineCode,
  type MarkdownCodeProps,
} from './code-block'

type CodeComponentProps = ComponentPropsWithoutRef<'code'> &
  ExtraProps &
  MarkdownCodeProps

export interface MarkdownRendererProps {
  content: string
  includeCodeBlockStyles?: boolean
  streaming?: boolean
}

function sanitizeMarkdownElementProps<T extends { node?: unknown }>(props: T) {
  const nextProps = { ...props }
  delete nextProps.node
  return nextProps
}

function hasClassName(value: string | undefined, expectedClassName: string) {
  return value?.split(/\s+/).includes(expectedClassName) ?? false
}

function containsBlockChild(children: ReactNode) {
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

function normalizeMarkdownContent(
  content: string,
  { completeUnclosedFence = false }: { completeUnclosedFence?: boolean } = {}
) {
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
    if (nextLines.length > 0 && nextLines[nextLines.length - 1].trim()) {
      nextLines.push('')
    }

    nextLines.push(activeFenceMarker.repeat(3))
  }

  return nextLines.join('\n')
}

const markdownComponents: Components = {
  h1({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <h1
        className="text-2xl leading-tight font-semibold tracking-tight text-(--mst-color-text-primary) not-first:mt-5"
        {...elementProps}
      >
        {children}
      </h1>
    )
  },
  h2({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <h2
        className="text-xl leading-tight font-semibold tracking-tight text-(--mst-color-text-primary) not-first:mt-4"
        {...elementProps}
      >
        {children}
      </h2>
    )
  },
  h3({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <h3
        className="text-lg leading-tight font-semibold text-(--mst-color-text-primary) not-first:mt-4"
        {...elementProps}
      >
        {children}
      </h3>
    )
  },
  p({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)
    const className = 'leading-6 text-(--mst-color-text-primary) not-first:mt-3'

    if (containsBlockChild(children)) {
      return (
        <div className={className} {...elementProps}>
          {children}
        </div>
      )
    }

    return (
      <p className={className} {...elementProps}>
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
  ul({ children, className, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)
    const isTaskList = hasClassName(className, 'contains-task-list')

    return (
      <ul
        className={
          isTaskList
            ? 'space-y-1.5 pl-0 leading-6 text-(--mst-color-text-primary) not-first:mt-3'
            : 'list-disc space-y-2 pl-6 leading-6 text-(--mst-color-text-primary) marker:text-(--mst-color-primary) not-first:mt-3'
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
        className="list-decimal space-y-2 pl-6 leading-6 text-(--mst-color-text-primary) marker:font-semibold marker:text-(--mst-color-primary) not-first:mt-3"
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
  pre({ children }) {
    const childNodes = Children.toArray(children)
    const firstChild = childNodes[0]

    if (isValidElement<CodeComponentProps>(firstChild)) {
      const {
        children: codeChildren,
        className,
        ...codeProps
      } = firstChild.props

      return (
        <CodeBlock className={className} includeStyles={false} {...codeProps}>
          {codeChildren}
        </CodeBlock>
      )
    }

    return <pre>{children}</pre>
  },
  code(props) {
    return renderInlineCode(sanitizeMarkdownElementProps(props))
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
  table({ children, ...props }) {
    const elementProps = sanitizeMarkdownElementProps(props)

    return (
      <div
        className="my-4 overflow-hidden border border-(--mst-color-border-default)"
        data-markdown="table-wrapper"
      >
        <div className="overflow-x-auto">
          <table
            className="w-full table-fixed border-collapse text-left"
            {...elementProps}
          >
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
        className="px-4 py-2 text-left text-sm leading-5 font-semibold whitespace-nowrap first:w-[22%]"
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
        className="px-4 py-2 text-sm leading-6 wrap-break-word first:w-[22%]"
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

export function MarkdownRenderer({
  content,
  includeCodeBlockStyles = true,
  streaming = false,
}: MarkdownRendererProps) {
  const normalizedContent = normalizeMarkdownContent(content, {
    completeUnclosedFence: streaming,
  })

  return (
    <div className="min-w-0 text-sm leading-6 text-(--mst-color-text-primary) select-text">
      {includeCodeBlockStyles ? <CodeBlockStyles /> : null}
      <Markdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {normalizedContent}
      </Markdown>
    </div>
  )
}
