import Link from 'next/link'
import {
  ChevronRight,
  CircleCheck,
  Code,
  FileText,
  MianshitongLogoMark,
  MessageSquare,
  Sparkles,
  Surface,
} from '@mianshitong/ui'
import { HomeDemoCarousel } from '@/components/home-demo-carousel'
import { WebHeaderActions } from '@/components/web-header-actions'
import { getCurrentUser } from '@/server/auth-session'

const highlights = [
  '专注前端开发领域',
  '基于最新技术栈',
  'AI 智能分析',
  '即时反馈建议',
] as const

const features = [
  {
    title: '简历优化',
    description: '专业的简历分析和优化建议，帮你打造脱颖而出的简历。',
    icon: FileText,
  },
  {
    title: '模拟面试',
    description: '真实的面试场景模拟，提供即时反馈和改进建议。',
    icon: MessageSquare,
  },
  {
    title: '面试题解答',
    description: '涵盖前端、算法、系统设计等各类编程面试题详解。',
    icon: Code,
  },
] as const

const demos = [
  {
    title: '简历智能分析',
    description: '上传简历，AI 自动分析并提供优化建议。',
  },
  {
    title: '模拟面试场景',
    description: '真实面试对话，实时反馈和评分。',
  },
  {
    title: '面试题详解',
    description: '前端经典面试题目，详细解答和思路分析。',
  },
] as const

export default async function HomePage() {
  const currentUser = await getCurrentUser()
  const currentUserEmail = currentUser?.email ?? null

  return (
    <div className="min-h-screen">
      <header>
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pt-5">
          <div className="flex items-center justify-between gap-3 rounded-full px-3 py-2 bg-transparent dark:border-white/10 md:rounded-none md:border-0 md:px-0 md:py-0">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <MianshitongLogoMark
                aria-hidden="true"
                className="size-8 rounded-xl shadow-(--mst-shadow-sm) sm:size-9"
              />
              <span className="text-lg font-semibold text-(--mst-color-primary)">
                面试通
              </span>
            </div>
            <WebHeaderActions userEmail={currentUserEmail} />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--mst-color-border-default) bg-slate-900/4 px-3 py-1 text-sm text-(--mst-color-text-secondary) dark:bg-white/6">
            <Sparkles className="size-4 text-(--mst-color-primary)" />
            <span>由 AI 驱动的智能面试助手</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-balance text-(--mst-color-text-primary) md:text-6xl">
            你的专属
            <span className="text-(--mst-color-primary)"> AI Agent</span> 面试官
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-balance text-(--mst-color-text-secondary) md:text-xl">
            专注编程领域，尤其前端开发。提供简历优化、模拟面试、面试题解答等全方位面试辅导服务。
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-(--mst-color-primary) px-8 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
              href="/chat"
            >
              立即开始
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8 md:gap-6">
            {highlights.map((item) => (
              <div
                className="flex items-center gap-2 text-sm text-(--mst-color-text-secondary)"
                key={item}
              >
                <CircleCheck className="size-4 text-(--mst-color-primary)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24"
        id="features"
      >
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold text-balance text-(--mst-color-text-primary) md:text-4xl">
            核心功能
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-balance text-(--mst-color-text-secondary)">
            全方位的面试准备解决方案
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon

            return (
              <Surface
                className="space-y-4 rounded-lg p-6 shadow-(--mst-shadow-sm) transition-colors hover:border-(--mst-color-primary) dark:bg-white/4"
                key={item.title}
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-(--mst-color-primary)/10 text-(--mst-color-primary)">
                  <Icon className="size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-(--mst-color-text-primary)">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-(--mst-color-text-secondary)">
                    {item.description}
                  </p>
                </div>
              </Surface>
            )
          })}
        </div>
      </section>

      <section className=" px-4 py-16  md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-balance text-(--mst-color-text-primary) md:text-4xl">
              功能演示
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-balance text-(--mst-color-text-secondary)">
              看看 AI 面试官如何帮助你准备面试
            </p>
          </div>

          <HomeDemoCarousel demos={demos} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col space-y-6 rounded-lg bg-(--mst-color-primary) p-8 text-center text-white shadow-(--mst-shadow-sm) md:p-12">
          <h2 className="text-3xl font-bold text-balance md:text-4xl">
            准备好开始你的面试准备了吗？
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-balance text-white/90">
            立即与 AI 面试官对话，获取专业的面试指导和建议。
          </p>
          <div className="flex pt-4">
            <Link
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-white px-8 text-sm font-semibold text-(--mst-color-primary) transition-colors hover:bg-slate-100"
              href="/chat"
            >
              开始对话
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-(--mst-color-border-default)">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-(--mst-color-primary)">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="text-sm text-(--mst-color-text-muted)">
                © 2026 面试通
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
