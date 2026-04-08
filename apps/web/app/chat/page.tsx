import Link from 'next/link'
import { ChevronRight, Surface } from '@mianshitong/ui'

export default function ChatPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl items-center px-4 py-10 md:px-6">
      <Surface
        className="w-full rounded-4xl px-6 py-10 text-center md:px-10 md:py-14"
        style={{
          background:
            'radial-gradient(circle at top left, rgb(15 108 189 / 0.12), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
          boxShadow: '0 32px 80px rgb(15 23 42 / 0.12)',
        }}
      >
        <p className="text-sm font-semibold tracking-[0.16em] text-(--mst-color-primary) uppercase">
          apps/web/chat
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-(--mst-color-text-primary) md:text-5xl">
          聊天页正在迁移中
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-(--mst-color-text-secondary) md:text-lg">
          首页迁移已经接通，这里先保留一个占位入口。下一步我们可以把老仓的聊天主链路逐步迁到当前项目。
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-(--mst-color-primary) px-6 py-3.5 text-sm font-semibold text-white shadow-(--mst-shadow-sm) transition-transform duration-200 hover:-translate-y-0.5"
            href="/"
          >
            返回首页
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </Surface>
    </main>
  )
}
