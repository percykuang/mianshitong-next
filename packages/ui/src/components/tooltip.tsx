'use client'

import { Tooltip as AntTooltip } from 'antd'
import type { TooltipProps as AntTooltipProps } from 'antd'

export type TooltipProps = AntTooltipProps

export function Tooltip(props: TooltipProps) {
  return <AntTooltip {...props} />
}
