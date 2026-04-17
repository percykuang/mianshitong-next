'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  AppBrand,
  Button,
  FormField,
  Input,
  Surface,
  useAppInstance,
} from '@mianshitong/ui'

interface LoginScreenProps {
  redirectTo: string
}

export function LoginScreen({ redirectTo }: LoginScreenProps) {
  const router = useRouter()
  const { message } = useAppInstance()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  const submitDisabled = useMemo(
    () => pending || !email.trim() || password.length === 0,
    [email, password, pending]
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitDisabled) {
      return
    }

    setPending(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(payload?.error ?? '登录失败，请稍后重试')
      }

      router.replace(redirectTo)
      router.refresh()
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '登录失败，请稍后重试'
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="relative overflow-hidden bg-[#0b1422]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgb(66_104_181/0.28),transparent_30%),radial-gradient(circle_at_82%_18%,rgb(30_64_175/0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgb(15_23_42/0.4),transparent_30%),linear-gradient(180deg,#0e1828_0%,#09111d_100%)]" />

      <div className="flex min-h-screen items-center justify-center px-4 py-10 md:px-6">
        <div className="w-full max-w-115">
          <Surface className="rounded-3xl border-white/10 bg-[rgb(11_20_34/0.78)] p-6 shadow-[0_24px_80px_rgb(0_0_0/0.34)] backdrop-blur-xl md:p-8">
            <AppBrand
              labelClassName="text-[#9ebeff]"
              logoClassName="size-11 rounded-2xl shadow-none"
            />

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <FormField
                className="[&_label]:text-sm [&_label]:font-medium [&_label]:text-[#dbe7ff]"
                label="邮箱"
              >
                <Input
                  autoComplete="email"
                  className="h-13 rounded-xl border-white/10! bg-white/6! text-white! placeholder:text-slate-400! shadow-none! hover:border-[#4d76c5]! focus:border-[#5d89e8]! focus:shadow-[0_0_0_2px_rgb(77_118_197/0.18)]!"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  size="lg"
                  value={email}
                />
              </FormField>

              <FormField
                className="[&_label]:text-sm [&_label]:font-medium [&_label]:text-[#dbe7ff]"
                label="密码"
              >
                <Input
                  autoComplete="current-password"
                  className="h-13 rounded-xl border-white/10! bg-white/6! text-white! placeholder:text-slate-400! shadow-none! hover:border-[#4d76c5]! focus:border-[#5d89e8]! focus:shadow-[0_0_0_2px_rgb(77_118_197/0.18)]!"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                  size="lg"
                  type="password"
                  value={password}
                />
              </FormField>

              <Button
                block
                className="h-13 rounded-xl border-0! bg-[#3166da]! text-base font-medium text-white shadow-[0_12px_30px_rgb(49_102_218/0.34)] hover:bg-[#3d73e6]! disabled:bg-white/10! disabled:text-white/40! disabled:shadow-none!"
                disabled={submitDisabled}
                htmlType="submit"
                loading={pending}
                size="lg"
                variant="primary"
              >
                登录
              </Button>
            </form>
          </Surface>
        </div>
      </div>
    </main>
  )
}
