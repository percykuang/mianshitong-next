import { radiusScale, shadowScale, spaceScale } from './scales'

// 语义 token 是应用真正消费的设计语言：
// 组件和页面应依赖这些语义名，而不是直接依赖底层 scale 或具体色值。
export const semanticTokens = {
  colorBgPage: '#f5f7fb',
  colorBgSurface: '#ffffff',
  colorBgElevated: '#ffffff',
  colorTextPrimary: '#101828',
  colorTextSecondary: '#475467',
  colorTextMuted: '#667085',
  colorBorderDefault: '#dfe3ea',
  colorBorderStrong: '#c6ceda',
  colorPrimary: '#1677ff',
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorDanger: '#dc2626',
  colorInfo: '#0f6cbd',
  radiusSm: radiusScale.sm,
  radiusMd: radiusScale.md,
  radiusLg: radiusScale.lg,
  radiusXl: radiusScale.xl,
  shadowSm: shadowScale.sm,
  shadowMd: shadowScale.md,
  shadowLg: shadowScale.lg,
  space1: spaceScale[1],
  space2: spaceScale[2],
  space3: spaceScale[3],
  space4: spaceScale[4],
  space5: spaceScale[5],
  space6: spaceScale[6],
  space7: spaceScale[7],
} as const

type TokenKey = keyof typeof semanticTokens

// 对外暴露可扩展的 token 类型：
// 保留 key 结构稳定，但允许具体数值在不同主题覆盖中变化。
export type MianshitongTokens = {
  [K in TokenKey]: (typeof semanticTokens)[K] extends number ? number : string
}
