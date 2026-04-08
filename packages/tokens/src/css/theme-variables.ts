import type { MianshitongTokens } from '../semantic'
import { createThemeTokens, type ThemeApp } from '../themes/create-theme-tokens'

const tokenVariableMap = {
  colorBgPage: '--mst-color-bg-page',
  colorBgSurface: '--mst-color-bg-surface',
  colorBgElevated: '--mst-color-bg-elevated',
  colorTextPrimary: '--mst-color-text-primary',
  colorTextSecondary: '--mst-color-text-secondary',
  colorTextMuted: '--mst-color-text-muted',
  colorBorderDefault: '--mst-color-border-default',
  colorBorderStrong: '--mst-color-border-strong',
  colorPrimary: '--mst-color-primary',
  colorSuccess: '--mst-color-success',
  colorWarning: '--mst-color-warning',
  colorDanger: '--mst-color-danger',
  colorInfo: '--mst-color-info',
  radiusSm: '--mst-radius-sm',
  radiusMd: '--mst-radius-md',
  radiusLg: '--mst-radius-lg',
  radiusXl: '--mst-radius-xl',
  shadowSm: '--mst-shadow-sm',
  shadowMd: '--mst-shadow-md',
  shadowLg: '--mst-shadow-lg',
  space1: '--mst-space-1',
  space2: '--mst-space-2',
  space3: '--mst-space-3',
  space4: '--mst-space-4',
  space5: '--mst-space-5',
  space6: '--mst-space-6',
  space7: '--mst-space-7',
} satisfies Record<keyof MianshitongTokens, `--mst-${string}`>

type TokenVariableEntry = [keyof MianshitongTokens, `--mst-${string}`]

function serializeTokenValue(value: string | number) {
  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}

function createThemeRule(selector: string, tokens: MianshitongTokens) {
  const declarations = (
    Object.entries(tokenVariableMap) as TokenVariableEntry[]
  )
    .map(
      ([tokenName, cssVariableName]) =>
        `  ${cssVariableName}: ${serializeTokenValue(tokens[tokenName])};`
    )
    .join('\n')

  return `${selector} {\n${declarations}\n}`
}

export function createThemeVariablesStyleText(app: ThemeApp) {
  return [
    createThemeRule(':root', createThemeTokens(app, 'light')),
    createThemeRule("html[data-theme='dark']", createThemeTokens(app, 'dark')),
  ].join('\n\n')
}
