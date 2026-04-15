'use client'

import { forwardRef } from 'react'
import { Input as AntInput } from 'antd'
import type { TextAreaProps } from 'antd/es/input'

export interface TextareaProps extends Omit<TextAreaProps, 'status'> {
  status?: 'default' | 'error' | 'warning'
}

export const Textarea = forwardRef<
  React.ComponentRef<typeof AntInput.TextArea>,
  TextareaProps
>(function Textarea({ status = 'default', ...props }, ref) {
  return (
    <AntInput.TextArea
      {...props}
      ref={ref}
      status={status === 'default' ? undefined : status}
    />
  )
})
