import { createThemeVariablesStyleText } from '@mianshitong/tokens'
import { AdminUiProvider, AppUiRegistry } from '@mianshitong/ui'
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: '面试通 | 后台管理',
  description: '面向运营与管理的后台管理系统',
}

const themeVariablesStyleText = createThemeVariablesStyleText('admin')

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html data-theme="light" lang="zh-CN">
      <head>
        <style>{themeVariablesStyleText}</style>
      </head>
      <body className="mst-app mst-app-admin">
        <AppUiRegistry>
          <AdminUiProvider>{children}</AdminUiProvider>
        </AppUiRegistry>
      </body>
    </html>
  )
}
