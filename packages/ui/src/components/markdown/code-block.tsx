'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Check, Copy, Download } from '@mianshitong/icons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ExtraProps } from 'react-markdown'
import { useThemeMode } from '../../providers/app-ui-provider'
import { highlightCodeBlock } from './highlight'

export type MarkdownCodeProps = ComponentPropsWithoutRef<'code'> &
  ExtraProps & {
    inline?: boolean
  }

export type CodeBlockProps = MarkdownCodeProps & {
  includeStyles?: boolean
}

const codeBlockStyleText = `
.mst-ui-code-block-fallback {
  margin: 0;
  overflow-x: auto;
  padding: 1rem;
  background: rgb(248 250 252);
  color: rgb(30 41 59);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.3334;
}

.mst-ui-code-block-fallback code {
  display: block;
  tab-size: 2;
  font-size: inherit;
  line-height: inherit;
}

html[data-theme='dark'] .mst-ui-code-block-fallback {
  background: #24292e;
  color: #e1e4e8;
}

.mst-ui-code-block .shiki {
  margin: 0;
  padding: 1rem !important;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.3334;
}

.mst-ui-code-block .shiki code {
  display: block;
  min-width: max-content;
  tab-size: 2;
  font-size: inherit !important;
  line-height: inherit !important;
}

.mst-ui-code-block .shiki code span {
  font-size: inherit !important;
  line-height: inherit !important;
}

.mst-ui-code-block[data-wrap='true'] .shiki {
  white-space: pre-wrap !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mst-ui-code-block[data-wrap='true'] .shiki code {
  min-width: 0;
  white-space: inherit !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mst-ui-code-block[data-wrap='true'] .shiki code span {
  white-space: inherit !important;
}

.mst-ui-code-block[data-wrap='true'] .mst-ui-code-block-fallback {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mst-ui-code-block[data-wrap='true'] .mst-ui-code-block-fallback code {
  min-width: 0;
  white-space: inherit;
}
`

const DOWNLOAD_EXTENSION_MAP: Record<string, string> = {
  bash: 'sh',
  css: 'css',
  go: 'go',
  html: 'html',
  javascript: 'js',
  js: 'js',
  json: 'json',
  jsx: 'jsx',
  markdown: 'md',
  md: 'md',
  python: 'py',
  py: 'py',
  shell: 'sh',
  sh: 'sh',
  sql: 'sql',
  text: 'txt',
  ts: 'ts',
  tsx: 'tsx',
  typescript: 'ts',
  vue: 'vue',
  yaml: 'yml',
  yml: 'yml',
  zsh: 'sh',
}

interface HighlightResult {
  key: string
  html: string | null
}

interface CodeActionButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
}

export function CodeBlockStyles() {
  return <style>{codeBlockStyleText}</style>
}

function normalizeLanguage(languageClassName?: string) {
  const match = /language-([\w-]+)/.exec(languageClassName ?? '')
  return (match?.[1] ?? 'text').toLowerCase()
}

function getDownloadFilename(language: string) {
  const extension = DOWNLOAD_EXTENSION_MAP[language] ?? 'txt'
  return `file.${extension}`
}

function shouldWrapCodeBlock(language: string) {
  return ['markdown', 'md', 'text', 'txt'].includes(language)
}

function sanitizeCodeElementProps(
  props: Omit<MarkdownCodeProps, 'children' | 'className'>
) {
  const nextProps = { ...props }
  delete nextProps.inline
  delete nextProps.node
  return nextProps
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

function CodeBlockFallback({ code }: { code: string }) {
  return (
    <pre className="mst-ui-code-block-fallback">
      <code>{code}</code>
    </pre>
  )
}

export function CodeBlock({
  children,
  className,
  includeStyles = true,
  ...rest
}: CodeBlockProps) {
  const { themeMode } = useThemeMode()
  const elementProps = sanitizeCodeElementProps(rest)
  const language = normalizeLanguage(className)
  const wrap = shouldWrapCodeBlock(language)
  const code = String(children).replace(/\n$/, '')
  const highlightKey = useMemo(
    () => `${themeMode}\u0000${language}\u0000${code}`,
    [code, language, themeMode]
  )
  const [highlightResult, setHighlightResult] =
    useState<HighlightResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const copiedTimerRef = useRef<number | null>(null)
  const downloadedTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    void highlightCodeBlock(code, language, themeMode).then((html) => {
      if (!cancelled) {
        setHighlightResult({ key: highlightKey, html })
      }
    })

    return () => {
      cancelled = true

      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current)
      }

      if (downloadedTimerRef.current) {
        window.clearTimeout(downloadedTimerRef.current)
      }
    }
  }, [code, highlightKey, language, themeMode])

  const isHighlighting = highlightResult?.key !== highlightKey
  const highlightedHtml = isHighlighting
    ? null
    : (highlightResult?.html ?? null)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)

    if (copiedTimerRef.current) {
      window.clearTimeout(copiedTimerRef.current)
    }

    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false)
      copiedTimerRef.current = null
    }, 1500)
  }, [code])

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = getDownloadFilename(language)
    anchor.click()
    URL.revokeObjectURL(url)

    setDownloaded(true)

    if (downloadedTimerRef.current) {
      window.clearTimeout(downloadedTimerRef.current)
    }

    downloadedTimerRef.current = window.setTimeout(() => {
      setDownloaded(false)
      downloadedTimerRef.current = null
    }, 1500)
  }, [code, language])

  return (
    <>
      {includeStyles ? <CodeBlockStyles /> : null}
      <div
        className="mst-ui-code-block my-4 w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
        data-wrap={wrap ? 'true' : undefined}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100/80 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400">
          <span className="ml-1 font-mono lowercase">{language}</span>
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
              onClick={handleDownload}
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
              onClick={() => {
                void handleCopy()
              }}
            />
          </div>
        </div>
        <div {...elementProps}>
          {highlightedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <CodeBlockFallback code={code} />
          )}
          {isHighlighting ? (
            <span className="sr-only">代码高亮加载中</span>
          ) : null}
        </div>
      </div>
    </>
  )
}
