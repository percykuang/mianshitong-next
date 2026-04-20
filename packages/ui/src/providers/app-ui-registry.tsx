import type { ReactNode } from 'react'

import { AntdRegistry } from '@ant-design/nextjs-registry'

export interface AppUiRegistryProps {
  children: ReactNode
}

export function AppUiRegistry({ children }: AppUiRegistryProps) {
  return <AntdRegistry>{children}</AntdRegistry>
}
