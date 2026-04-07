'use client'

import { Spin } from 'antd'
import type { SpinProps } from 'antd'

export type SpinnerProps = SpinProps

export function Spinner(props: SpinnerProps) {
  return <Spin {...props} />
}
