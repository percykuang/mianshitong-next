'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Button,
  FormField,
  Input,
  MianshitongLogoMark,
  Surface,
} from '@mianshitong/ui'
import type { AuthPageCopy } from './auth-copy'

interface AuthFormCardProps {
  mode: 'login' | 'register'
  copy: AuthPageCopy
}

function resolveSubmitHint(mode: AuthFormCardProps['mode']) {
  if (mode === 'login') {
    return '当前为前端占位页，服务端登录能力尚未接入。'
  }

  return '当前为前端占位页，服务端注册能力尚未接入。'
}

export function AuthFormCard({ mode, copy }: AuthFormCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submittedHint, setSubmittedHint] = useState<string | null>(null)

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgb(22_119_255/0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgb(56_189_248/0.14),transparent_28%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_440px] lg:items-center">
          <section className="hidden space-y-6 lg:block">
            <Link
              className="inline-flex items-center gap-3 rounded-full bg-transparent px-4 py-2 text-sm font-medium text-(--mst-color-text-primary) backdrop-blur-sm"
              href="/"
            >
              <MianshitongLogoMark
                aria-hidden="true"
                className="size-8 rounded-lg"
              />
              <span className="text-(--mst-color-primary)">面试通</span>
            </Link>

            <div className="max-w-xl space-y-4">
              <p className="text-sm font-semibold tracking-[0.2em] text-(--mst-color-primary) uppercase">
                MIAN SHI TONG
              </p>
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-(--mst-color-text-primary)">
                继续你的 AI 面试练习流程
              </h1>
              <p className="max-w-lg text-lg leading-8 text-(--mst-color-text-secondary)">
                账号体系接通后，你可以同步面试记录、简历分析结果与个性化偏好。当前先提供完整的前端页面与交互骨架。
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <Surface className="rounded-(--mst-radius-xl) p-5">
                <p className="text-sm font-semibold text-(--mst-color-text-primary)">
                  记录同步
                </p>
                <p className="mt-2 text-sm leading-6 text-(--mst-color-text-secondary)">
                  让你的模拟面试、题解记录与设置跨设备保持一致。
                </p>
              </Surface>
              <Surface className="rounded-(--mst-radius-xl) p-5">
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
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <MianshitongLogoMark
                aria-hidden="true"
                className="size-9 rounded-xl"
              />
              <div>
                <p className="text-sm font-semibold text-(--mst-color-text-primary)">
                  面试通
                </p>
                <p className="text-xs text-(--mst-color-text-muted)">
                  AI 面试准备助手
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-(--mst-color-text-primary)">
                {copy.title}
              </h2>
              <p className="text-sm leading-6 text-(--mst-color-text-secondary)">
                {copy.description}
              </p>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                setSubmittedHint(resolveSubmitHint(mode))
              }}
            >
              <FormField label="邮箱">
                <Input
                  autoComplete="email"
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSubmittedHint(null)
                  }}
                  placeholder="请输入邮箱地址"
                  size="lg"
                  type="email"
                  value={email}
                />
              </FormField>

              <FormField label="密码">
                <Input
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setSubmittedHint(null)
                  }}
                  placeholder={copy.passwordPlaceholder}
                  size="lg"
                  type="password"
                  value={password}
                />
              </FormField>

              {submittedHint ? (
                <div className="rounded-(--mst-radius-lg) border border-(--mst-color-border-default) bg-slate-900/4 px-4 py-3 text-sm text-(--mst-color-text-secondary) dark:bg-white/4">
                  {submittedHint}
                </div>
              ) : null}

              <Button
                className="h-11 w-full"
                disabled={!email || !password}
                htmlType="submit"
                size="lg"
                variant="primary"
              >
                {copy.submitLabel}
              </Button>
            </form>

            <p className="mt-5 text-sm text-(--mst-color-text-secondary)">
              {copy.footerText}{' '}
              <Link
                className="font-medium text-(--mst-color-primary) transition-colors hover:opacity-80"
                href={copy.footerLinkHref}
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
