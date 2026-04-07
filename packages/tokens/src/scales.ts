// 这层只放原子级尺度，避免组件和业务代码直接散落硬编码数值。
export const spaceScale = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
} as const

// 圆角分级保持轻量，后续语义 token 再决定具体场景该用哪一级。
export const radiusScale = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
} as const

// 阴影同样先定义基础等级，给页面壳层和卡片类组件统一复用。
export const shadowScale = {
  sm: '0 1px 2px rgb(16 24 40 / 0.06)',
  md: '0 10px 24px rgb(16 24 40 / 0.08)',
  lg: '0 18px 44px rgb(16 24 40 / 0.12)',
} as const
