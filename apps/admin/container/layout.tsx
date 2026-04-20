'use client'

import type { ReactNode } from 'react'

import {
  AppBrand,
  AppLayout,
  AppLayoutContent,
  AppLayoutSider,
  AuthEntry,
  MessageSquare,
  NavMenu,
  User,
} from '@mianshitong/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLogout } from '@/hooks'

const NAV_ITEMS = [
  { href: '/users', label: '用户', icon: <User className="size-4" /> },
  {
    href: '/sessions',
    label: '会话',
    icon: <MessageSquare className="size-4" />,
  },
] as const

function resolveSelectedKey(pathname: string): string {
  const direct = NAV_ITEMS.find((item) => item.href === pathname)

  if (direct) {
    return direct.href
  }

  const nested = NAV_ITEMS.find((item) => pathname.startsWith(`${item.href}/`))

  return nested?.href ?? '/users'
}

export function Layout({
  children,
  userEmail,
}: {
  children: ReactNode
  userEmail: string
}) {
  const pathname = usePathname()
  const { logout, pending } = useLogout()
  const selectedKey = resolveSelectedKey(pathname)
  const menuItems = NAV_ITEMS.map((item) => ({
    key: item.href,
    label: <Link href={item.href}>{item.label}</Link>,
    icon: item.icon,
  }))

  return (
    <AppLayout
      hasSider
      style={{
        alignItems: 'stretch',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        minHeight: '100vh',
        overflowX: 'auto',
        overflowY: 'hidden',
        width: '100vw',
      }}
    >
      <AppLayoutSider
        className="admin-sider"
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          flex: '0 0 256px',
          height: '100vh',
          maxWidth: 256,
          minWidth: 256,
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          width: 256,
        }}
        theme="dark"
        width={256}
      >
        <div className="flex px-3 py-5">
          <AppBrand
            href="/users"
            labelClassName="text-[#9ebeff]"
            logoClassName="size-8 shrink-0"
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <NavMenu
            className="admin-nav-menu"
            items={menuItems}
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            style={{
              fontSize: 14,
            }}
            theme="dark"
          />
        </div>

        <div className="mt-auto border-t border-[rgb(255_255_255/0.08)] p-2">
          <AuthEntry
            classNames={{
              authenticatedContainer:
                'h-10 gap-3 rounded-full border-[#22344d]! bg-[#16253a]! px-3 text-white/92! shadow-none!',
              avatar:
                'size-7 shrink-0 border-[#2a3d59]! bg-[#1b2c44]! text-[#9ebeff]! shadow-none!',
              email:
                'text-[15px] leading-none font-medium tracking-[-0.01em] text-white/92!',
              logoutButton:
                'size-8 cursor-pointer text-white/64! hover:bg-white/6! hover:text-white! disabled:text-white/40!',
              userIcon: 'size-[18px]',
            }}
            logoutPending={pending}
            onLogout={logout}
            userLabel={userEmail}
            variant="sidebar"
          />
        </div>
      </AppLayoutSider>

      <AppLayoutContent
        className="min-w-280"
        style={{
          display: 'block',
          flex: '1 0 1120px',
          width: 'auto',
        }}
      >
        <main
          className="admin-content-scroll"
          style={{
            height: '100vh',
            overflow: 'auto',
            padding: '24px 32px 24px',
          }}
        >
          {children}
        </main>
      </AppLayoutContent>
    </AppLayout>
  )
}
