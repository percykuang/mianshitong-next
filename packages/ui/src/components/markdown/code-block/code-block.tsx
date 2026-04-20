'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Check, Copy, Download } from '@mianshitong/icons'
import { useTransientFlag } from '@mianshitong/hooks'
import { useCallback } from 'react'
import type { ExtraProps } from 'react-markdown'
import { useThemeMode } from '../../../providers/app-ui-provider'
import {
  getDownloadFilename,
  getCodeTextContent,
  normalizeLanguage,
  sanitizeCodeElementProps,
  shouldWrapCodeBlock,
} from './utils'
import { useCodeHighlight } from './use-highlight'

// 代码块 UI，包括复制、下载、代码块容器结构。

export type MarkdownCodeProps = ComponentPropsWithoutRef<'code'> &
  ExtraProps & {
    inline?: boolean
  }

export type CodeBlockProps = MarkdownCodeProps

interface CodeActionButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
}

interface CodeBlockToolbarProps {
  copied: boolean
  downloaded: boolean
  languageId: string
  onCopy: () => void
  onDownload: () => void
}

const ACTION_FEEDBACK_DURATION_MS = 1500

function CodeActionButton({ icon, label, onClick }: CodeActionButtonProps) {
  return (
    <button
      aria-label={label}
      className="cursor-pointer p-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  )
}

function CodeBlockToolbar({
  copied,
  downloaded,
  languageId,
  onCopy,
  onDownload,
}: CodeBlockToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100/80 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400">
      <span className="ml-1 font-mono lowercase">{languageId}</span>
      <div className="flex items-center gap-2">
        <CodeActionButton
          icon={
            downloaded ? (
              <Check className="size-3.5" />
            ) : (
              <Download className="size-3.5" />
            )
          }
          label="下载代码"
          onClick={onDownload}
        />
        <CodeActionButton
          icon={
            copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )
          }
          label="复制代码"
          onClick={onCopy}
        />
      </div>
    </div>
  )
}

function CodeBlockFallback({ code }: { code: string }) {
  return (
    <pre className="mst-ui-code-block-fallback">
      <code>{code}</code>
    </pre>
  )
}

export function renderInlineCode({
  children,
  className,
  ...rest
}: MarkdownCodeProps) {
  const elementProps = sanitizeCodeElementProps(rest)

  return (
    <code
      className={`wrap-break-word whitespace-break-spaces rounded-md bg-slate-900/6 px-1.5 py-0.5 font-mono text-[0.9em] text-(--mst-color-primary) dark:bg-white/8 ${className ?? ''}`.trim()}
      {...elementProps}
    >
      {children}
    </code>
  )
}

export function CodeBlock({ children, className, ...rest }: CodeBlockProps) {
  const { themeMode } = useThemeMode()
  const codeElementProps = sanitizeCodeElementProps(rest)
  const languageId = normalizeLanguage(className)
  const shouldWrap = shouldWrapCodeBlock(languageId)
  const codeText = getCodeTextContent(children).replace(/\n$/, '')
  const { cachedHighlightedHtml, highlightedContent, isHighlighting } =
    useCodeHighlight({
      code: codeText,
      language: languageId,
      themeMode,
    })
  const { active: copied, trigger: showCopiedState } = useTransientFlag(
    ACTION_FEEDBACK_DURATION_MS
  )
  const { active: downloaded, trigger: showDownloadedState } = useTransientFlag(
    ACTION_FEEDBACK_DURATION_MS
  )

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(codeText)
    showCopiedState()
  }, [codeText, showCopiedState])

  const handleDownload = useCallback(() => {
    const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = getDownloadFilename(languageId)
    anchor.click()
    URL.revokeObjectURL(url)
    showDownloadedState()
  }, [codeText, languageId, showDownloadedState])

  // 渲染层的最后一道保险：真正空的代码块不应占位显示成一个“假代码块”。
  if (!codeText.trim()) {
    return null
  }

  return (
    <div
      className="mst-ui-code-block my-4 w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
      data-wrap={shouldWrap ? 'true' : undefined}
    >
      <CodeBlockToolbar
        copied={copied}
        downloaded={downloaded}
        languageId={languageId}
        onCopy={() => {
          void handleCopy()
        }}
        onDownload={handleDownload}
      />
      <div className="mst-ui-code-block-body" {...codeElementProps}>
        {highlightedContent ? (
          highlightedContent
        ) : cachedHighlightedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: cachedHighlightedHtml }} />
        ) : (
          <CodeBlockFallback code={codeText} />
        )}
        {isHighlighting ? (
          <span className="sr-only">代码高亮加载中</span>
        ) : null}
      </div>
    </div>
  )
}
