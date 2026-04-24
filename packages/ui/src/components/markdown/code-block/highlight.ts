'use client'

import { InFlightTaskCache, LruCache } from '@mianshitong/shared/runtime'
import {
  type BundledLanguage,
  bundledLanguages,
  codeToHtml,
} from 'shiki/bundle/web'

import type { ThemeMode } from '../../../providers/app-ui-provider'

const LIGHT_THEME = 'github-light'
const DARK_THEME = 'github-dark'
const MAX_HIGHLIGHT_CACHE_ENTRIES = 300

const highlightHtmlCache = new LruCache<string, string | null>(
  MAX_HIGHLIGHT_CACHE_ENTRIES
)
const highlightInFlightCache = new InFlightTaskCache<string, string | null>()

function isBundledLanguage(language: string): language is BundledLanguage {
  return language in bundledLanguages
}

export function resolveShikiLanguage(language: string): BundledLanguage | null {
  const normalizedLanguage = language.trim().toLowerCase()

  if (!normalizedLanguage || normalizedLanguage === 'text') {
    return null
  }

  return isBundledLanguage(normalizedLanguage) ? normalizedLanguage : null
}

export function createHighlightCacheKey(
  code: string,
  language: string,
  themeMode: ThemeMode
) {
  return `${themeMode}\u0000${language}\u0000${code}`
}

export function getCachedHighlightHtml(cacheKey: string) {
  return highlightHtmlCache.get(cacheKey)
}

function cacheHighlightHtml(cacheKey: string, html: string | null) {
  highlightHtmlCache.set(cacheKey, html)
}

export async function highlightCodeBlock(
  code: string,
  language: string,
  themeMode: ThemeMode
) {
  const cacheKey = createHighlightCacheKey(code, language, themeMode)

  if (highlightHtmlCache.has(cacheKey)) {
    return highlightHtmlCache.get(cacheKey) ?? null
  }

  const html = await highlightInFlightCache.getOrCreate(cacheKey, async () => {
    const resolvedLanguage = resolveShikiLanguage(language)

    if (!resolvedLanguage) {
      return null
    }

    return codeToHtml(code, {
      lang: resolvedLanguage,
      theme: themeMode === 'dark' ? DARK_THEME : LIGHT_THEME,
    })
  })

  cacheHighlightHtml(cacheKey, html)
  return html
}
