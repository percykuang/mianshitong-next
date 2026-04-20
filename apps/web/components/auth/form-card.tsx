'use client'

import { App } from 'antd'
import type { InputRef } from 'antd'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, type SyntheticEvent, type ChangeEvent } from 'react'
import {
  AppBrand,
  Button,
  FormField,
  Input,
  PasswordInput,
  Surface,
} from '@mianshitong/ui'
import type { AuthPageCopy } from './copy'
import {
  createAuthPageHref,
  isAuthFieldError,
  resolveAuthRedirect,
  validateRegistrationEmail,
  validateRegistrationPassword,
} from '@/utils/auth'

interface AuthFormCardProps {
  mode: 'login' | 'register'
  copy: AuthPageCopy
}

const featureCardBaseClass =
  'rounded-(--mst-radius-xl) border border-(--mst-color-border-default) p-5 shadow-[0_18px_38px_rgb(15_23_42/0.05)]'

const syncFeatureCardClass =
  'bg-[linear-gradient(145deg,rgb(22_119_255/0.13),rgb(255_255_255/0.94)_34%,rgb(14_165_233/0.1))] dark:bg-[linear-gradient(145deg,rgb(22_119_255/0.2),rgb(17_24_39/0.92)_34%,rgb(14_165_233/0.16))]'

const personalizedFeatureCardClass =
  'bg-[linear-gradient(145deg,rgb(15_23_42/0.08),rgb(255_255_255/0.93)_36%,rgb(22_119_255/0.09))] dark:bg-[linear-gradient(145deg,rgb(30_41_59/0.92),rgb(17_24_39/0.92)_34%,rgb(22_119_255/0.16))]'

export function AuthFormCard({ mode, copy }: AuthFormCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message } = App.useApp()
  const emailInputRef = useRef<InputRef>(null)
  const passwordInputRef = useRef<InputRef>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const redirectTarget = resolveAuthRedirect(searchParams.get('redirect'))
  const alternateAuthHref = createAuthPageHref(
    copy.footerLinkHref,
    redirectTarget
  )
  const submitButtonClassName = pending
    ? 'h-11 w-full cursor-not-allowed! bg-(--mst-color-primary)! text-white! hover:bg-(--mst-color-primary)!'
    : 'h-11 w-full'

  function focusEmailField() {
    emailInputRef.current?.focus()
  }

  function focusPasswordField() {
    passwordInputRef.current?.focus({ cursor: 'end' })
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const nextEmailError =
      mode === 'register' ? validateRegistrationEmail(email) : null
    const nextPasswordError =
      mode === 'register' ? validateRegistrationPassword(password) : null

    if (nextEmailError) {
      setEmailError(nextEmailError)
      focusEmailField()
    }

    if (nextPasswordError) {
      setPasswordError(nextPasswordError)
      if (!nextEmailError) {
        focusPasswordField()
      }
    }

    if (nextEmailError || nextPasswordError) {
      return
    }

    setEmailError(null)
    setPasswordError(null)
    setPending(true)

    // 表单层只负责收集与反馈，真正的鉴权结果以后端响应为准。
    void fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string | { field?: string; message?: string }
          }

          throw (
            data.error ??
            (mode === 'login' ? '登录失败，请稍后重试' : '注册失败，请稍后重试')
          )
        }

        router.replace(redirectTarget)
      })
      .catch((error: unknown) => {
        if (mode === 'register' && isAuthFieldError(error)) {
          if (error.field === 'email') {
            setEmailError(error.message)
            focusEmailField()
          } else if (error.field === 'password') {
            setPasswordError(error.message)
            focusPasswordField()
          }

          setPending(false)
          return
        }

        message.error(
          error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : '提交失败，请稍后重试'
        )
        setPending(false)
      })
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    const nextEmail = event.target.value
    setEmail(nextEmail)

    if (emailError) {
      setEmailError(null)
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    const nextPassword = event.target.value
    setPassword(nextPassword)

    if (passwordError) {
      setPasswordError(null)
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgb(22_119_255/0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgb(56_189_248/0.14),transparent_28%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_440px] lg:items-center">
          <section className="hidden space-y-6 lg:block">
            <AppBrand className="rounded-full bg-transparent px-4 py-2 font-medium text-(--mst-color-text-primary) backdrop-blur-sm" />

            <div className="max-w-xl space-y-4">
              <p className="text-sm font-semibold tracking-[0.2em] text-(--mst-color-primary) uppercase">
                MIAN SHI TONG
              </p>
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-(--mst-color-text-primary)">
                继续你的 AI 面试练习流程
              </h1>
              <p className="max-w-lg text-lg leading-8 text-(--mst-color-text-secondary)">
                账号体系接通后，你可以同步面试记录、简历分析结果与个性化偏好。
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <Surface
                className={`${featureCardBaseClass} ${syncFeatureCardClass}`}
              >
                <p className="text-sm font-semibold text-(--mst-color-text-primary)">
                  记录同步
                </p>
                <p className="mt-2 text-sm leading-6 text-(--mst-color-text-secondary)">
                  让你的模拟面试、题解记录与设置跨设备保持一致。
                </p>
              </Surface>
              <Surface
                className={`${featureCardBaseClass} ${personalizedFeatureCardClass}`}
              >
                <p className="text-sm font-semibold text-(--mst-color-text-primary)">
                  个性体验
                </p>
                <p className="mt-2 text-sm leading-6 text-(--mst-color-text-secondary)">
                  基于你的目标岗位、简历内容与练习节奏持续优化建议。
                </p>
              </Surface>
            </div>
          </section>

          <Surface className="rounded-(--mst-radius-xl) p-6 md:p-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-(--mst-color-text-primary)">
                {copy.title}
              </h2>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <FormField error={emailError} label="邮箱">
                <Input
                  autoComplete="email"
                  classNames={{
                    input: 'text-sm placeholder:text-sm',
                  }}
                  onChange={handleEmailChange}
                  placeholder="请输入邮箱地址"
                  ref={emailInputRef}
                  size="lg"
                  status={
                    mode === 'register' && emailError ? 'error' : 'default'
                  }
                  type="email"
                  value={email}
                />
              </FormField>

              <FormField error={passwordError} label="密码">
                <PasswordInput
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  classNames={{
                    input: 'text-sm placeholder:text-sm',
                    suffix:
                      'text-(--mst-color-text-muted) transition-colors hover:text-(--mst-color-primary)',
                  }}
                  onChange={handlePasswordChange}
                  placeholder={copy.passwordPlaceholder}
                  ref={passwordInputRef}
                  size="lg"
                  status={
                    mode === 'register' && passwordError ? 'error' : 'default'
                  }
                  value={password}
                />
              </FormField>

              <Button
                className={submitButtonClassName}
                disabled={!email || !password || pending}
                htmlType="submit"
                size="lg"
                variant="primary"
              >
                {pending
                  ? mode === 'login'
                    ? '登录中...'
                    : '注册中...'
                  : copy.submitLabel}
              </Button>
            </form>

            <p className="mt-5 text-sm text-(--mst-color-text-secondary)">
              {copy.footerText}{' '}
              <Link
                className="font-medium text-(--mst-color-primary) transition-colors hover:opacity-80"
                href={alternateAuthHref}
              >
                {copy.footerLinkText}
              </Link>
            </p>

            <div className="mt-8 border-t border-(--mst-color-border-default) pt-5">
              <Link
                className="text-sm text-(--mst-color-text-muted) transition-colors hover:text-(--mst-color-primary)"
                href="/"
              >
                返回首页
              </Link>
            </div>
          </Surface>
        </div>
      </div>
    </main>
  )
}
