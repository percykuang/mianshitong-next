'use client'

import { Skeleton as AntSkeleton } from 'antd'
import type { SkeletonProps as AntSkeletonProps } from 'antd'

export type SkeletonProps = AntSkeletonProps

export function Skeleton(props: SkeletonProps) {
  return <AntSkeleton {...props} />
}
