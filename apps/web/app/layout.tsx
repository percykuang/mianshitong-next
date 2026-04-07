import type { Metadata } from 'next'
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
      <body>{children}</body>
    </html>
  )
}
