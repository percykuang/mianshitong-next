'use client'

import { Dropdown as AntDropdown } from 'antd'
import type { DropdownProps as AntDropdownProps } from 'antd'

import { resolvePopupContainer } from '../utils/resolve-popup-container'

export type DropdownProps = AntDropdownProps

export function Dropdown({
  getPopupContainer = resolvePopupContainer,
  ...props
}: DropdownProps) {
  return <AntDropdown {...props} getPopupContainer={getPopupContainer} />
}
