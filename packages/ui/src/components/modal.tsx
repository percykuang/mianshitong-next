'use client'

import { Modal as AntModal } from 'antd'
import type { ModalProps as AntModalProps } from 'antd'
import type { ReactNode } from 'react'

export interface ModalProps extends Omit<AntModalProps, 'open'> {
  open: boolean
  confirmText?: ReactNode
  cancelText?: ReactNode
}

export function Modal({
  confirmText = '确定',
  cancelText = '取消',
  ...props
}: ModalProps) {
  return <AntModal {...props} cancelText={cancelText} okText={confirmText} />
}
