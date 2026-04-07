'use client'

import { Input as AntInput } from 'antd'
import type { TextAreaProps } from 'antd/es/input'

export interface TextareaProps extends Omit<TextAreaProps, 'status'> {
  status?: 'default' | 'error' | 'warning'
}

export function Textarea({ status = 'default', ...props }: TextareaProps) {
  return (
    <AntInput.TextArea
      {...props}
      status={status === 'default' ? undefined : status}
    />
  )
}
