import type { Metadata } from 'next'
import '@mianshitong/tokens/variables.css'
import { AppUiProvider } from '@mianshitong/ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mianshitong Admin',
  description: '面向运营与管理的后台模板',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="mst-app mst-app-admin">
        <AppUiProvider app="admin">{children}</AppUiProvider>
      </body>
    </html>
  )
}
