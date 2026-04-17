'use client'

import { Menu as AntMenu } from 'antd'
import type { MenuProps as AntMenuProps } from 'antd'

export type NavMenuProps = AntMenuProps

export function NavMenu(props: NavMenuProps) {
  return <AntMenu {...props} />
}
