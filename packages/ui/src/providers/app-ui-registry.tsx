import { AntdRegistry } from '@ant-design/nextjs-registry'
import type { ReactNode } from 'react'

export interface AppUiRegistryProps {
  children: ReactNode
}

export function AppUiRegistry({ children }: AppUiRegistryProps) {
  return <AntdRegistry>{children}</AntdRegistry>
}
