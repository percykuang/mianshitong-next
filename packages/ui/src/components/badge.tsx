'use client'

import { Tag } from 'antd'
import type { TagProps } from 'antd'

const colorMap = {
  default: 'default',
  primary: 'processing',
  success: 'success',
  warning: 'warning',
  danger: 'error',
} as const

export interface BadgeProps extends Omit<TagProps, 'color'> {
  tone?: keyof typeof colorMap
}

export function Badge({ tone = 'default', ...props }: BadgeProps) {
  return <Tag {...props} color={colorMap[tone]} />
}
