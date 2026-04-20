'use client'

import type { ReactNode } from 'react'

import { Modal as AntModal } from 'antd'

import { ModalAppBridge, getModalAppMethod } from './bridge'
import { createPrompt } from './prompt'
import type {
  ModalComponent,
  ModalFuncProps,
  ModalMethod,
  ModalMethodName,
  ModalProps,
} from './types'

function normalizeModalFuncProps({
  centered,
  cancelText,
  confirmText,
  okText,
  closable,
  ...props
}: ModalFuncProps): ModalFuncProps {
  return {
    ...props,
    closable: closable ?? false,
    centered: centered ?? true,
    cancelText: cancelText ?? '取消',
    okText: okText ?? confirmText ?? '确定',
  }
}

function createModalMethod(methodName: ModalMethodName): ModalMethod {
  return (props) => {
    const normalizedProps = normalizeModalFuncProps(props)
    const appMethod = getModalAppMethod(methodName)

    if (appMethod) {
      return appMethod(normalizedProps)
    }

    return AntModal[methodName](normalizedProps)
  }
}

const confirm = createModalMethod('confirm')
const prompt = createPrompt(confirm)

function ModalRoot({
  confirmText = '确定',
  cancelText = '取消',
  ...props
}: ModalProps): ReactNode {
  return <AntModal {...props} cancelText={cancelText} okText={confirmText} />
}

export const Modal = Object.assign(ModalRoot, {
  confirm,
  destroyAll: AntModal.destroyAll,
  error: createModalMethod('error'),
  info: createModalMethod('info'),
  prompt,
  success: createModalMethod('success'),
  useModal: AntModal.useModal,
  warn: createModalMethod('warning'),
  warning: createModalMethod('warning'),
}) satisfies ModalComponent

export { ModalAppBridge }
export type { ModalFuncProps, ModalPromptProps, ModalProps } from './types'
