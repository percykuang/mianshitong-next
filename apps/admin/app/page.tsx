const metrics = [
  { label: '今日会话', value: '1,284' },
  { label: '待处理反馈', value: '23' },
  { label: '模型成功率', value: '99.2%' },
]

const items = [
  '仪表盘入口已经准备好，后续可以继续拆成 overview、users、settings 等路由。',
  '默认使用独立端口，便于与 web 应用并行开发。',
  '保留了足够轻的样式层，方便你后面接入组件库或设计系统。',
]

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
      <section className="rounded-[28px] border border-emerald-300/12 bg-slate-950/70 p-6 shadow-[0_36px_72px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-9">
        <div>
          <span className="inline-flex items-center rounded-full bg-emerald-300/12 px-4 py-2 text-sm font-bold tracking-[0.12em] text-emerald-300 uppercase">
            apps/admin
          </span>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.02] font-bold tracking-[-0.04em] text-slate-50 md:text-6xl">
            后台管理端模板已完成初始化
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            这里适合继续扩展成数据概览、内容审核、用户管理或系统配置后台。
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <article
              className="rounded-3xl border border-emerald-300/14 bg-slate-900/90 p-6"
              key={metric.label}
            >
              <span className="block text-sm text-slate-400">
                {metric.label}
              </span>
              <strong className="mt-3 block text-4xl leading-none font-semibold text-slate-50">
                {metric.value}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-emerald-300/12 bg-slate-950/70 p-6 shadow-[0_36px_72px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
        <h2 className="text-2xl font-semibold text-slate-50">
          下一步可以直接接入
        </h2>
        <div className="mt-5 grid gap-4">
          {items.map((item) => (
            <article
              className="rounded-3xl border border-slate-300/12 bg-white/4 p-5"
              key={item}
            >
              <p className="leading-7 text-slate-300">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
