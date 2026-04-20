'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'

import {
  createJavaScriptRegexEngine,
  useShikiHighlighter,
} from 'react-shiki/web'

import type { ThemeMode } from '../../../providers/app-ui-provider'
import {
  createHighlightCacheKey,
  getCachedHighlightHtml,
  highlightCodeBlock,
  resolveShikiLanguage,
} from './highlight'

interface UseCodeHighlightOptions {
  code: string
  language: string
  themeMode: ThemeMode
}

const HIGHLIGHT_DELAY_MS = 72
const shikiEngine = createJavaScriptRegexEngine({ forgiving: true })

export function useCodeHighlight({
  code,
  language,
  themeMode,
}: UseCodeHighlightOptions) {
  const resolvedLanguage = useMemo(
    () => resolveShikiLanguage(language),
    [language]
  )

  const theme = themeMode === 'dark' ? 'github-dark' : 'github-light'

  const cachedHighlightedHtml = useMemo(() => {
    if (!resolvedLanguage) {
      return null
    }
    const cacheKey = createHighlightCacheKey(code, language, themeMode)
    return getCachedHighlightHtml(cacheKey) ?? null
  }, [code, language, resolvedLanguage, themeMode])

  const highlightedContent = useShikiHighlighter(
    code,
    resolvedLanguage ?? undefined,
    theme,
    {
      delay: HIGHLIGHT_DELAY_MS,
      engine: shikiEngine,
    }
  )

  useEffect(() => {
    if (cachedHighlightedHtml !== null || !resolvedLanguage) {
      return
    }

    void highlightCodeBlock(code, language, themeMode)
  }, [cachedHighlightedHtml, code, language, resolvedLanguage, themeMode])

  return {
    cachedHighlightedHtml,
    highlightedContent:
      resolvedLanguage !== null && highlightedContent
        ? highlightedContent
        : null,
    isHighlighting: resolvedLanguage !== null && highlightedContent === null,
  } satisfies {
    cachedHighlightedHtml: string | null
    highlightedContent: ReactNode | null
    isHighlighting: boolean
  }
}
