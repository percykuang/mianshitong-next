'use client'

import { Input as AntInput } from 'antd'
import type { SearchProps as AntSearchProps } from 'antd/es/input/Search'

export interface SearchInputProps extends Omit<AntSearchProps, 'size'> {
  size?: 'sm' | 'md' | 'lg'
}

function resolveSize(size: SearchInputProps['size']) {
  if (size === 'sm') {
    return 'small'
  }

  if (size === 'lg') {
    return 'large'
  }

  return 'middle'
}

export function SearchInput({ size = 'md', ...props }: SearchInputProps) {
  return <AntInput.Search {...props} size={resolveSize(size)} />
}
