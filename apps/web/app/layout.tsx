import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { DEFAULT_THEME_MODE, THEME_COOKIE_KEY } from '@mianshitong/shared'
import { createThemeVariablesStyleText } from '@mianshitong/tokens'
import { AppUiProvider } from '@mianshitong/ui'
import './globals.css'

function parseThemeCookie(value: string | undefined) {
  return value === 'dark' || value === 'light' ? value : DEFAULT_THEME_MODE
}

export const metadata: Metadata = {
  title: '面试通 | AI 面试官',
  description: '你的专属 AI Agent 面试官，支持模拟面试、简历优化与题解答疑。',
  icons: {
    icon: '/icon.svg',
  },
}

const themeVariablesStyleText = createThemeVariablesStyleText('web')

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE_KEY)?.value)

  return (
    <html data-theme={theme} lang="zh-CN" suppressHydrationWarning>
      <head>
        <style>{themeVariablesStyleText}</style>
      </head>
      <body className="mst-app mst-app-web">
        <AppUiProvider app="web">{children}</AppUiProvider>
      </body>
    </html>
  )
}
