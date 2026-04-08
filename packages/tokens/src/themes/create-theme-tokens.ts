import type { MianshitongTokens } from '../semantic'
import { adminThemeOverrides } from './admin'
import { darkTheme } from './dark'
import { lightTheme } from './light'
import { webThemeOverrides } from './web'

export type ThemeMode = 'light' | 'dark'
export type ThemeApp = 'web' | 'admin'

export function createThemeTokens(
  app: ThemeApp,
  themeMode: ThemeMode
): MianshitongTokens {
  return {
    ...(themeMode === 'dark' ? darkTheme : lightTheme),
    ...(app === 'web' ? webThemeOverrides : adminThemeOverrides),
  }
}
