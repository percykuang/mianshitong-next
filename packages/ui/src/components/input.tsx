'use client'

import { Input as AntInput } from 'antd'
import type { InputProps as AntInputProps } from 'antd'

export interface InputProps extends Omit<AntInputProps, 'size' | 'status'> {
  size?: 'sm' | 'md' | 'lg'
  status?: 'default' | 'error' | 'warning'
}

function resolveSize(size: InputProps['size']): AntInputProps['size'] {
  if (size === 'sm') {
    return 'small'
  }

  if (size === 'lg') {
    return 'large'
  }

  return 'middle'
}

export function Input({
  size = 'md',
  status = 'default',
  ...props
}: InputProps) {
  return (
    <AntInput
      {...props}
      size={resolveSize(size)}
      status={status === 'default' ? undefined : status}
    />
  )
}
