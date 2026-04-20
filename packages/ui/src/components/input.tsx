'use client'

import { forwardRef } from 'react'

import { Input as AntInput } from 'antd'
import type { InputProps as AntInputProps } from 'antd'
import type { InputRef } from 'antd'

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

export const Input = forwardRef<InputRef, InputProps>(function Input(
  { size = 'md', status = 'default', ...props },
  ref
) {
  return (
    <AntInput
      {...props}
      ref={ref}
      size={resolveSize(size)}
      status={status === 'default' ? undefined : status}
    />
  )
})
