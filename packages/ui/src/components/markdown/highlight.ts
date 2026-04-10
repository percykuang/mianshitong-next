'use client'

import {
  bundledLanguages,
  codeToHtml,
  type BundledLanguage,
} from 'shiki/bundle/web'
import type { ThemeMode } from '../../providers/app-ui-provider'

const LIGHT_THEME = 'github-light'
const DARK_THEME = 'github-dark'

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

export async function highlightCodeBlock(
  code: string,
  language: string,
  themeMode: ThemeMode
) {
  const resolvedLanguage = resolveShikiLanguage(language)

  if (!resolvedLanguage) {
    return null
  }

  return codeToHtml(code, {
    lang: resolvedLanguage,
    theme: themeMode === 'dark' ? DARK_THEME : LIGHT_THEME,
  })
}
