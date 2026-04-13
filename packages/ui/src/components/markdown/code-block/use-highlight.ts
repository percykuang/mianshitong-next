'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ThemeMode } from '../../../providers/app-ui-provider'
import {
  createHighlightCacheKey,
  getCachedHighlightHtml,
  highlightCodeBlock,
} from './highlight'

interface HighlightResult {
  key: string
  html: string | null
}

interface UseCodeHighlightOptions {
  code: string
  language: string
  themeMode: ThemeMode
}

const HIGHLIGHT_DEBOUNCE_MS = 120

function getCachedHighlightResult(cacheKey: string) {
  const cachedHtml = getCachedHighlightHtml(cacheKey)

  return cachedHtml === undefined ? null : { key: cacheKey, html: cachedHtml }
}

export function useCodeHighlight({
  code,
  language,
  themeMode,
}: UseCodeHighlightOptions) {
  const highlightKey = useMemo(
    () => createHighlightCacheKey(code, language, themeMode),
    [code, language, themeMode]
  )
  const cachedHighlightResult = useMemo(
    () => getCachedHighlightResult(highlightKey),
    [highlightKey]
  )
  const [highlightResult, setHighlightResult] =
    useState<HighlightResult | null>(cachedHighlightResult)

  useEffect(() => {
    if (cachedHighlightResult) {
      return
    }

    let active = true
    const timer = window.setTimeout(() => {
      void highlightCodeBlock(code, language, themeMode).then((html) => {
        if (!active) {
          return
        }

        setHighlightResult({ key: highlightKey, html })
      })
    }, HIGHLIGHT_DEBOUNCE_MS)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [cachedHighlightResult, code, highlightKey, language, themeMode])

  return {
    highlightedHtml:
      cachedHighlightResult?.html ??
      (highlightResult?.key === highlightKey ? highlightResult.html : null),
    isHighlighting:
      !cachedHighlightResult && highlightResult?.key !== highlightKey,
  }
}
