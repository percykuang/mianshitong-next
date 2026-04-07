'use client'

import '@ant-design/v5-patch-for-react-19'
import { StyleProvider } from '@ant-design/cssinjs'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App, ConfigProvider } from 'antd'
import {
  adminThemeOverrides,
  createAntdTheme,
  lightTheme,
  type MianshitongTokens,
  webThemeOverrides,
} from '@mianshitong/tokens'
import type { ReactNode } from 'react'

export interface AppUiProviderProps {
  app: 'web' | 'admin'
  children: ReactNode
}

function createThemeTokens(app: AppUiProviderProps['app']): MianshitongTokens {
  return {
    ...lightTheme,
    ...(app === 'web' ? webThemeOverrides : adminThemeOverrides),
  }
}

export function AppUiProvider({ app, children }: AppUiProviderProps) {
  const themeTokens = createThemeTokens(app)

  return (
    <AntdRegistry>
      <StyleProvider layer>
        <ConfigProvider theme={createAntdTheme(themeTokens)}>
          <App>{children}</App>
        </ConfigProvider>
      </StyleProvider>
    </AntdRegistry>
  )
}
