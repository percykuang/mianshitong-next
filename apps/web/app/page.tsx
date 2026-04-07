const features = [
  'App Router + TypeScript 最小骨架',
  '适合在 monorepo 中继续拆分共享包',
  '保留清晰的页面与样式入口，方便后续扩展业务模块',
]

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <section className="rounded-[28px] border border-slate-900/10 bg-white/75 p-6 shadow-[0_30px_60px_rgba(19,34,56,0.12)] backdrop-blur-xl md:p-12">
        <span className="inline-flex items-center rounded-full bg-sky-600/12 px-4 py-2 text-sm font-bold tracking-[0.12em] text-sky-700 uppercase">
          apps/web
        </span>
        <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] font-bold tracking-[-0.04em] text-slate-900 md:text-7xl">
          用户侧 Web 应用已经就位
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
          这是一个适合作为产品主站、聊天页或业务前台的 Next.js 模板起点。
          结构保持轻量，方便你下一步接入鉴权、接口层和共享组件。
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <a
            className="inline-flex items-center justify-center rounded-2xl bg-sky-700 px-5 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sky-800"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
          >
            查看 Next.js 文档
          </a>
          <span className="text-sm text-slate-600 md:text-base">
            从这里继续搭你的实际业务页面
          </span>
        </div>
      </section>

      <section className="mt-7 rounded-[28px] border border-slate-900/10 bg-white/75 p-6 shadow-[0_30px_60px_rgba(19,34,56,0.12)] backdrop-blur-xl md:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">当前模板包含</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              className="rounded-3xl border border-slate-900/8 bg-white/70 p-6 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
              key={feature}
            >
              <p className="leading-7">{feature}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
