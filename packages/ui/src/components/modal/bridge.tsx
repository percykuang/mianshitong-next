'use client'

import { useEffect } from 'react'

import { App } from 'antd'

import type { ModalAppApi, ModalMethodName } from './types'

let modalAppApi: ModalAppApi | null = null

export function getModalAppMethod(methodName: ModalMethodName) {
  return modalAppApi?.[methodName]
}

export function ModalAppBridge() {
  const { modal } = App.useApp()

  useEffect(() => {
    modalAppApi = modal as ModalAppApi

    return () => {
      if (modalAppApi === modal) {
        modalAppApi = null
      }
    }
  }, [modal])

  return null
}
