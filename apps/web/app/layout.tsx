import type { Metadata } from 'next'
import '@mianshitong/tokens/variables.css'
import { AppUiProvider } from '@mianshitong/ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mianshitong Web',
  description: '面向用户侧的 Web 应用模板',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="mst-app mst-app-web">
        <AppUiProvider app="web">{children}</AppUiProvider>
      </body>
    </html>
  )
}
