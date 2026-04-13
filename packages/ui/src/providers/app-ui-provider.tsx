'use client'

import '@ant-design/v5-patch-for-react-19'
import { StyleProvider } from '@ant-design/cssinjs'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App, ConfigProvider } from 'antd'
import {
  createAntdTheme,
  createThemeTokens,
  type ThemeMode as MianshitongThemeMode,
} from '@mianshitong/tokens'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ModalAppBridge } from '../components/modal/index'

const THEME_STORAGE_KEY = 'mst-theme'
const THEME_COOKIE_KEY = 'mst-theme'

export type ThemeMode = MianshitongThemeMode

interface ThemeModeContextValue {
  themeMode: ThemeMode
  setThemeMode: (themeMode: ThemeMode) => void
  toggleThemeMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function readThemeCookieValue(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const prefix = `${THEME_COOKIE_KEY}=`
  const cookieItem = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))

  return cookieItem?.slice(prefix.length)
}

function readInitialThemeMode(): ThemeMode {
  if (typeof document === 'undefined') {
    return 'light'
  }

  let storedTheme: string | undefined
  try {
    storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) ?? undefined
  } catch {
    storedTheme = undefined
  }

  if (isThemeMode(storedTheme)) {
    return storedTheme
  }

  const cookieTheme = readThemeCookieValue()

  if (isThemeMode(cookieTheme)) {
    return cookieTheme
  }

  const documentTheme = document.documentElement.dataset.theme

  if (isThemeMode(documentTheme)) {
    return documentTheme
  }

  return 'light'
}

function applyThemeMode(themeMode: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = themeMode
  document.documentElement.style.colorScheme = themeMode

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
  } catch {
    // 忽略浏览器禁用存储的场景，主题仍可在当前会话内工作。
  }

  document.cookie = `${THEME_COOKIE_KEY}=${themeMode}; Path=/; Max-Age=31536000; SameSite=Lax`
}

export interface AppUiProviderProps {
  app: 'web' | 'admin'
  children: ReactNode
}

export function AppUiProvider({ app, children }: AppUiProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readInitialThemeMode)
  const themeTokens = createThemeTokens(app, themeMode)

  useEffect(() => {
    applyThemeMode(themeMode)
  }, [themeMode])

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode: () => {
        setThemeMode((currentMode) =>
          currentMode === 'light' ? 'dark' : 'light'
        )
      },
    }),
    [themeMode]
  )

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <AntdRegistry>
        <StyleProvider layer>
          <ConfigProvider theme={createAntdTheme(themeTokens)}>
            <App>
              <ModalAppBridge />
              {children}
            </App>
          </ConfigProvider>
        </StyleProvider>
      </AntdRegistry>
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within AppUiProvider')
  }

  return context
}
