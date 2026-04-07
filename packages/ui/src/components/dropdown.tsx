'use client'

import { Dropdown as AntDropdown } from 'antd'
import type { DropdownProps as AntDropdownProps } from 'antd'

export type DropdownProps = AntDropdownProps

export function Dropdown(props: DropdownProps) {
  return <AntDropdown {...props} />
}
