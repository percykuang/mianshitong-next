'use client'

import { Empty as AntEmpty } from 'antd'
import type { EmptyProps as AntEmptyProps } from 'antd'

export type EmptyProps = AntEmptyProps

export function Empty(props: EmptyProps) {
  return <AntEmpty {...props} />
}
