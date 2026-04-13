import type { MarkdownCodeProps } from './code-block'

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

export function normalizeLanguage(languageClassName?: string) {
  const match = /language-([\w-]+)/.exec(languageClassName ?? '')
  return (match?.[1] ?? 'text').toLowerCase()
}

export function getDownloadFilename(language: string) {
  const extension = DOWNLOAD_EXTENSION_MAP[language] ?? 'txt'
  return `file.${extension}`
}

export function shouldWrapCodeBlock(language: string) {
  return ['markdown', 'md', 'text', 'txt'].includes(language)
}

export function sanitizeCodeElementProps(
  props: Omit<MarkdownCodeProps, 'children' | 'className'>
) {
  const nextProps = { ...props }
  delete nextProps.inline
  delete nextProps.node
  return nextProps
}
