'use client'

import { Layout as AntLayout } from 'antd'
import type { LayoutProps as AntLayoutProps } from 'antd'
import type { ComponentProps } from 'react'

export type AppLayoutProps = AntLayoutProps
export type AppLayoutHeaderProps = ComponentProps<typeof AntLayout.Header>
export type AppLayoutContentProps = ComponentProps<typeof AntLayout.Content>
export type AppLayoutFooterProps = ComponentProps<typeof AntLayout.Footer>
export type AppLayoutSiderProps = ComponentProps<typeof AntLayout.Sider>

export function AppLayout(props: AppLayoutProps) {
  return <AntLayout {...props} />
}

export function AppLayoutHeader(props: AppLayoutHeaderProps) {
  return <AntLayout.Header {...props} />
}

export function AppLayoutContent(props: AppLayoutContentProps) {
  return <AntLayout.Content {...props} />
}

export function AppLayoutFooter(props: AppLayoutFooterProps) {
  return <AntLayout.Footer {...props} />
}

export function AppLayoutSider(props: AppLayoutSiderProps) {
  return <AntLayout.Sider {...props} />
}
