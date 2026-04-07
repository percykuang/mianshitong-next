'use client'

import { Select as AntSelect } from 'antd'
import type { SelectProps as AntSelectProps } from 'antd'
import type { ReactNode } from 'react'

export interface SelectOption {
  label: ReactNode
  value: string
  disabled?: boolean
}

export interface SelectProps extends Omit<
  AntSelectProps,
  'onChange' | 'options' | 'size' | 'value'
> {
  size?: 'sm' | 'md' | 'lg'
  value?: string
  options: SelectOption[]
  onChange?: (value: string) => void
}

function resolveSize(size: SelectProps['size']): AntSelectProps['size'] {
  if (size === 'sm') {
    return 'small'
  }

  if (size === 'lg') {
    return 'large'
  }

  return 'middle'
}

export function Select({
  size = 'md',
  options,
  onChange,
  ...props
}: SelectProps) {
  return (
    <AntSelect
      {...props}
      options={options}
      size={resolveSize(size)}
      onChange={(value) => onChange?.(String(value))}
    />
  )
}
