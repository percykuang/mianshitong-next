'use client'

import type { ReactNode } from 'react'

import { Modal as AntModal } from 'antd'
import type {
  ModalFuncProps as AntModalFuncProps,
  ModalProps as AntModalProps,
} from 'antd'

import type { InputProps } from '../input'

export interface ModalProps extends Omit<AntModalProps, 'open'> {
  open: boolean
  confirmText?: ReactNode
  cancelText?: ReactNode
}

export interface ModalFuncProps extends AntModalFuncProps {
  confirmText?: ReactNode
}

export interface ModalPromptProps extends Omit<
  ModalFuncProps,
  'content' | 'onOk'
> {
  content?: ReactNode
  defaultValue?: string
  inputProps?: Omit<
    InputProps,
    'defaultValue' | 'maxLength' | 'placeholder' | 'value'
  >
  maxLength?: number
  onOk?: (value: string) => unknown
  placeholder?: string
  required?: boolean
  trimValue?: boolean
}

export type ModalMethodName =
  | 'confirm'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
export type ModalMethodReturn = ReturnType<typeof AntModal.confirm>
export type ModalMethod = (props: ModalFuncProps) => ModalMethodReturn
export type ModalPromptMethod = (props: ModalPromptProps) => ModalMethodReturn
export type ModalAppApi = Record<ModalMethodName, ModalMethod>
export type ModalComponent = ((props: ModalProps) => ReactNode) & {
  confirm: ModalMethod
  destroyAll: typeof AntModal.destroyAll
  error: ModalMethod
  info: ModalMethod
  prompt: ModalPromptMethod
  success: ModalMethod
  useModal: typeof AntModal.useModal
  warn: ModalMethod
  warning: ModalMethod
}
