import { semanticTokens } from '../semantic'

// Dark theme 保持与 light 主题一致的语义结构，只覆盖颜色与阴影等视觉值。
export const darkTheme = {
  ...semanticTokens,
  colorBgPage: '#08111f',
  colorBgSurface: '#0f1b2d',
  colorBgElevated: '#162338',
  colorTextPrimary: '#f8fafc',
  colorTextSecondary: '#d0d9e6',
  colorTextMuted: '#94a3b8',
  colorBorderDefault: '#22324b',
  colorBorderStrong: '#324665',
  colorPrimary: '#66a8ff',
  colorSuccess: '#4ade80',
  colorWarning: '#f59e0b',
  colorDanger: '#f87171',
  colorInfo: '#7dd3fc',
  shadowSm: '0 1px 2px rgb(2 6 23 / 32%)',
  shadowMd: '0 14px 30px rgb(2 6 23 / 36%)',
  shadowLg: '0 22px 56px rgb(2 6 23 / 42%)',
} as const
