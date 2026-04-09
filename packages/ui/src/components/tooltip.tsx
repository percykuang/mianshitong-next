'use client'

import { Tooltip as AntTooltip } from 'antd'
import type { TooltipProps as AntTooltipProps } from 'antd'
import { type ReactNode, useInsertionEffect } from 'react'
import { cn } from '../utils/cn'
import { resolvePopupContainer } from '../utils/resolve-popup-container'

const surfaceTooltipRootClass = 'mst-ui-tooltip-surface'
const surfaceTooltipStyleId = 'mst-ui-tooltip-surface-style'
const surfaceTooltipBaseStyles = {
  borderRadius: 'var(--mst-radius-md)',
  boxShadow: 'var(--mst-shadow-lg)',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '1.4',
  padding: '6px 10px',
} as const
const surfaceTooltipThemes = {
  light: {
    background: `color-mix(
  in srgb,
  var(--mst-color-bg-elevated) 92%,
  white 8%
)`,
    color: `color-mix(
  in srgb,
  var(--mst-color-text-primary) 82%,
  white 18%
)`,
  },
  dark: {
    borderColor: 'rgb(255 255 255 / 0.1)',
    background: `color-mix(
  in srgb,
  var(--mst-color-bg-elevated) 96%,
  black 4%
)`,
    color: `color-mix(
  in srgb,
  rgb(248 250 252 / 0.94) 84%,
  white 16%
)`,
  },
} as const

function createSurfaceTooltipStyles() {
  return `
  .${surfaceTooltipRootClass} .ant-tooltip-inner {
    border: 1px solid var(--mst-color-border-default);
    border-radius: ${surfaceTooltipBaseStyles.borderRadius};
    background: ${surfaceTooltipThemes.light.background};
    color: ${surfaceTooltipThemes.light.color};
    box-shadow: ${surfaceTooltipBaseStyles.boxShadow};
    font-size: ${surfaceTooltipBaseStyles.fontSize};
    font-weight: ${surfaceTooltipBaseStyles.fontWeight};
    line-height: ${surfaceTooltipBaseStyles.lineHeight};
    padding: ${surfaceTooltipBaseStyles.padding};
  }

  .${surfaceTooltipRootClass} .ant-tooltip-arrow::before {
    background: ${surfaceTooltipThemes.light.background};
  }

  html[data-theme='dark'] .${surfaceTooltipRootClass} .ant-tooltip-inner {
    border-color: ${surfaceTooltipThemes.dark.borderColor};
    background: ${surfaceTooltipThemes.dark.background};
    color: ${surfaceTooltipThemes.dark.color};
  }

  html[data-theme='dark'] .${surfaceTooltipRootClass} .ant-tooltip-arrow::before {
    background: ${surfaceTooltipThemes.dark.background};
  }
`
}

const surfaceTooltipStyles = createSurfaceTooltipStyles()

export type TooltipProps = AntTooltipProps & {
  children?: ReactNode
  variant?: 'default' | 'surface'
}

function useSurfaceTooltipStyles(enabled: boolean) {
  useInsertionEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return
    }

    if (document.getElementById(surfaceTooltipStyleId)) {
      return
    }

    const styleElement = document.createElement('style')
    styleElement.id = surfaceTooltipStyleId
    styleElement.textContent = surfaceTooltipStyles
    document.head.appendChild(styleElement)
  }, [enabled])
}

export function Tooltip({
  classNames,
  getPopupContainer = resolvePopupContainer,
  variant = 'default',
  ...props
}: TooltipProps) {
  useSurfaceTooltipStyles(variant === 'surface')

  const mergedClassNames =
    variant === 'surface'
      ? {
          ...classNames,
          root: cn(surfaceTooltipRootClass, classNames?.root),
        }
      : classNames

  return (
    <AntTooltip
      {...props}
      classNames={mergedClassNames}
      getPopupContainer={getPopupContainer}
    />
  )
}
