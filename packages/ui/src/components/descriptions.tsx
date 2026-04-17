'use client'

import { Descriptions as AntDescriptions } from 'antd'
import type { DescriptionsProps as AntDescriptionsProps } from 'antd'

export type DescriptionsProps = AntDescriptionsProps

export function Descriptions(props: DescriptionsProps) {
  return <AntDescriptions {...props} />
}
