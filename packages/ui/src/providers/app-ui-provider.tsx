'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { StyleProvider } from '@ant-design/cssinjs'
import '@ant-design/v5-patch-for-react-19'
import {
  DEFAULT_THEME_MODE,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
} from '@mianshitong/shared'
import {
  type ThemeMode as MianshitongThemeMode,
  createAntdTheme,
  createThemeTokens,
} from '@mianshitong/tokens'
import { App, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

import { CodeBlockStyles } from '../components/markdown/code-block/styles'
import { ModalAppBridge } from '../components/modal/index'

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
    return DEFAULT_THEME_MODE
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

  return DEFAULT_THEME_MODE
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

function ignoreThemeModeUpdate() {
  return undefined
}

export interface AppUiProviderProps {
  app: 'web'
  children: ReactNode
}

interface StaticAppUiProviderProps {
  app: 'web' | 'admin'
  children: ReactNode
  themeMode: ThemeMode
}

function UiRuntimeProvider({
  app,
  children,
  contextValue,
  themeMode,
}: StaticAppUiProviderProps & {
  contextValue: ThemeModeContextValue
}) {
  const themeTokens = createThemeTokens(app, themeMode)

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <StyleProvider layer>
        <ConfigProvider
          locale={zhCN}
          wave={{ disabled: true }}
          theme={createAntdTheme(themeTokens, themeMode)}
        >
          <App>
            <CodeBlockStyles />
            <ModalAppBridge />
            {children}
          </App>
        </ConfigProvider>
      </StyleProvider>
    </ThemeModeContext.Provider>
  )
}

export function AppUiProvider({ app, children }: AppUiProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readInitialThemeMode)

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
    <UiRuntimeProvider
      app={app}
      contextValue={contextValue}
      themeMode={themeMode}
    >
      {children}
    </UiRuntimeProvider>
  )
}

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const themeMode: ThemeMode = 'light'
  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({
      themeMode,
      setThemeMode: ignoreThemeModeUpdate,
      toggleThemeMode: ignoreThemeModeUpdate,
    }),
    [themeMode]
  )

  return (
    <UiRuntimeProvider
      app="admin"
      contextValue={contextValue}
      themeMode={themeMode}
    >
      {children}
    </UiRuntimeProvider>
  )
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within an app UI provider')
  }

  return context
}
