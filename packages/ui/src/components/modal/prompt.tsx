'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Input } from '../input'
import type {
  ModalMethod,
  ModalMethodReturn,
  ModalPromptMethod,
  ModalPromptProps,
} from './types'

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  const promiseCandidate = value as { then?: unknown }

  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof promiseCandidate.then === 'function'
  )
}

function getPromptOkButtonProps(
  okButtonProps: ModalPromptProps['okButtonProps'],
  value: string,
  trimValue: boolean,
  required: boolean
) {
  return {
    ...okButtonProps,
    disabled:
      okButtonProps?.disabled ||
      (required && (trimValue ? value.trim() : value).length === 0),
  }
}

interface ModalPromptContentProps {
  content: ReactNode
  defaultValue: string
  inputProps: ModalPromptProps['inputProps']
  maxLength: number | undefined
  onSubmit: () => void
  onValueChange: (value: string) => void
  placeholder: string | undefined
}

function ModalPromptContent({
  content,
  defaultValue,
  inputProps,
  maxLength,
  onSubmit,
  onValueChange,
  placeholder,
}: ModalPromptContentProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    onValueChange(value)
  }, [onValueChange, value])

  return (
    <div className="pt-1">
      {content ? (
        <div className="mb-3 text-sm leading-5 text-(--mst-color-text-secondary)">
          {content}
        </div>
      ) : null}
      <Input
        {...inputProps}
        autoFocus={inputProps?.autoFocus ?? true}
        maxLength={maxLength}
        onChange={(event) => {
          const nextValue = event.target.value
          setValue(nextValue)
          inputProps?.onChange?.(event)
        }}
        onPressEnter={(event) => {
          inputProps?.onPressEnter?.(event)

          if (!event.defaultPrevented) {
            onSubmit()
          }
        }}
        placeholder={placeholder}
        value={value}
      />
    </div>
  )
}

export function createPrompt(confirm: ModalMethod): ModalPromptMethod {
  return function prompt({
    centered = true,
    cancelButtonProps,
    content,
    defaultValue = '',
    inputProps,
    maxLength,
    okButtonProps,
    onOk,
    placeholder,
    required = false,
    trimValue = true,
    ...props
  }: ModalPromptProps): ModalMethodReturn {
    let currentValue = defaultValue
    let modalRef: ModalMethodReturn | null = null

    const updateOkButtonState = (value: string) => {
      currentValue = value
      modalRef?.update({
        okButtonProps: getPromptOkButtonProps(
          okButtonProps,
          value,
          trimValue,
          required
        ),
      })
    }

    const runOk = () => onOk?.(trimValue ? currentValue.trim() : currentValue)

    const submitFromInput = () => {
      const nextOkButtonProps = getPromptOkButtonProps(
        okButtonProps,
        currentValue,
        trimValue,
        required
      )

      if (nextOkButtonProps.disabled) {
        return
      }

      let result: unknown

      try {
        result = runOk()
      } catch {
        return
      }

      if (!isPromiseLike(result)) {
        modalRef?.destroy()
        return
      }

      modalRef?.update({
        okButtonProps: {
          ...nextOkButtonProps,
          loading: true,
        },
      })

      void Promise.resolve(result)
        .then(() => {
          modalRef?.destroy()
        })
        .catch(() => {
          modalRef?.update({
            okButtonProps: nextOkButtonProps,
          })
        })
    }

    modalRef = confirm({
      centered,
      ...props,
      cancelButtonProps,
      content: (
        <ModalPromptContent
          content={content}
          defaultValue={defaultValue}
          inputProps={inputProps}
          maxLength={maxLength}
          onSubmit={submitFromInput}
          onValueChange={updateOkButtonState}
          placeholder={placeholder}
        />
      ),
      icon: null,
      okButtonProps: getPromptOkButtonProps(
        okButtonProps,
        defaultValue,
        trimValue,
        required
      ),
      onOk: runOk,
    })

    return modalRef
  }
}
