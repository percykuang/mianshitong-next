'use client'

import { ThemeToggler } from '@mianshitong/ui'

import { AuthEntry } from '../auth'

export interface HomePageHeaderActionsProps {
  userEmail?: string | null
}

export function HomePageHeaderActions({
  userEmail = null,
}: HomePageHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      <AuthEntry userEmail={userEmail} variant="home" />
      <ThemeToggler />
    </div>
  )
}
