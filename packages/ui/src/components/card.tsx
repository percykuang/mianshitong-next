'use client'

import { Card as AntCard } from 'antd'
import type { CardProps as AntCardProps } from 'antd'

export type CardProps = AntCardProps

export function Card(props: CardProps) {
  return <AntCard {...props} />
}
