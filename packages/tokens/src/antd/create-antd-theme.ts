import type { ThemeConfig } from 'antd'
import type { MianshitongTokens } from '../semantic'
import type { ThemeMode } from '../themes/create-theme-tokens'

function createComponentTheme(themeMode: ThemeMode): ThemeConfig['components'] {
  if (themeMode !== 'dark') {
    return undefined
  }

  return {
    Button: {
      defaultShadow: 'none',
      dangerShadow: 'none',
      primaryShadow: 'none',
    },
  }
}

// 把仓库自己的语义 token 映射成 antd 可消费的主题配置，
// 这样业务层始终围绕 @mianshitong/tokens，而不是直接绑定 antd token 命名。
export function createAntdTheme(
  tokens: MianshitongTokens,
  themeMode: ThemeMode
): ThemeConfig {
  return {
    cssVar: true,
    hashed: false,
    components: createComponentTheme(themeMode),
    token: {
      colorPrimary: tokens.colorPrimary,
      colorSuccess: tokens.colorSuccess,
      colorWarning: tokens.colorWarning,
      colorError: tokens.colorDanger,
      colorInfo: tokens.colorInfo,
      colorBgBase: tokens.colorBgPage,
      colorBgContainer: tokens.colorBgSurface,
      colorBgElevated: tokens.colorBgElevated,
      colorTextBase: tokens.colorTextPrimary,
      colorTextSecondary: tokens.colorTextSecondary,
      colorTextTertiary: tokens.colorTextMuted,
      colorBorder: tokens.colorBorderDefault,
      boxShadow: tokens.shadowMd,
    },
  }
}
