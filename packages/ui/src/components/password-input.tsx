'use client'

import { forwardRef } from 'react'

import { Eye, EyeOff } from '@mianshitong/icons'
import { cn } from '@mianshitong/shared/ui'
import { Input as AntInput } from 'antd'
import type { InputRef } from 'antd'
import type { PasswordProps as AntPasswordProps } from 'antd/es/input/Password'

export interface PasswordInputProps extends Omit<
  AntPasswordProps,
  'size' | 'status' | 'iconRender'
> {
  size?: 'sm' | 'md' | 'lg'
  status?: 'default' | 'error' | 'warning'
  iconClassName?: string
}

function resolveSize(size: PasswordInputProps['size']) {
  if (size === 'sm') {
    return 'small'
  }

  if (size === 'lg') {
    return 'large'
  }

  return 'middle'
}

export const PasswordInput = forwardRef<InputRef, PasswordInputProps>(
  function PasswordInput(
    { size = 'md', status = 'default', iconClassName, classNames, ...props },
    ref
  ) {
    return (
      <AntInput.Password
        {...props}
        classNames={{
          ...classNames,
          suffix: cn('cursor-pointer', classNames?.suffix),
        }}
        iconRender={(visible) =>
          visible ? (
            <span>
              <EyeOff className={cn('size-4', iconClassName)} />
            </span>
          ) : (
            <span>
              <Eye className={cn('size-4', iconClassName)} />
            </span>
          )
        }
        ref={ref}
        size={resolveSize(size)}
        status={status === 'default' ? undefined : status}
      />
    )
  }
)
