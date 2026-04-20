'use client'

import { ReactNode } from 'react'

interface TitleProps {
  children: ReactNode
}

export function Title({ children }: TitleProps) {
  return (
    <h1 className="mb-6 text-2xl font-semibold tracking-tight text-[#111827]">
      {children}
    </h1>
  )
}
