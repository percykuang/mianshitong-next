import type { Metadata } from 'next'
import Script from 'next/script'
import { createThemeVariablesStyleText } from '@mianshitong/tokens'
import { AppUiProvider } from '@mianshitong/ui'
import './globals.css'

const themeInitScript = `
  (function () {
    try {
      var storedTheme = window.localStorage.getItem('mst-theme');
      var theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light';
    }
  })();
`

export const metadata: Metadata = {
  title: '面试通 | AI 面试官',
  description: '你的专属 AI Agent 面试官，支持模拟面试、简历优化与题解答疑。',
  icons: {
    icon: '/icon.svg',
  },
}

const themeVariablesStyleText = createThemeVariablesStyleText('web')

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html data-theme="light" lang="zh-CN" suppressHydrationWarning>
      <head>
        <style>{themeVariablesStyleText}</style>
      </head>
      <body className="mst-app mst-app-web">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <AppUiProvider app="web">{children}</AppUiProvider>
      </body>
    </html>
  )
}
