'use client'

import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'

export interface ButtonProps extends Omit<
  AntButtonProps,
  'color' | 'size' | 'type' | 'variant'
> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
}

function resolveButtonType(
  variant: ButtonProps['variant']
): AntButtonProps['type'] {
  if (variant === 'primary' || variant === 'danger') {
    return 'primary'
  }

  if (variant === 'link') {
    return 'link'
  }

  if (variant === 'text') {
    return 'text'
  }

  return 'default'
}

function resolveButtonSize(size: ButtonProps['size']): AntButtonProps['size'] {
  if (size === 'sm') {
    return 'small'
  }

  if (size === 'lg') {
    return 'large'
  }

  return 'middle'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  danger,
  ghost,
  ...props
}: ButtonProps) {
  return (
    <AntButton
      {...props}
      autoInsertSpace={false}
      danger={danger || variant === 'danger'}
      ghost={ghost || variant === 'ghost'}
      size={resolveButtonSize(size)}
      type={resolveButtonType(variant)}
    />
  )
}
