'use client'

import { ReactNode } from 'react'

interface TitleProps {
  children: ReactNode
}

export function Title({ children }: TitleProps) {
  return (
    <h1 className="text-2xl mb-6 font-semibold tracking-tight text-[#111827]">
      {children}
    </h1>
  )
}
