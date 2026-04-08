import { Dashboard, MessageSquare, Sparkles, Surface } from '@mianshitong/ui'

const metrics = [
  {
    label: '今日会话',
    value: '1,284',
    description: '较昨日增长 12%',
    icon: MessageSquare,
  },
  {
    label: '待处理反馈',
    value: '23',
    description: '优先关注高频问题',
    icon: Sparkles,
  },
  {
    label: '模型成功率',
    value: '99.2%',
    description: '最近 7 天保持稳定',
    icon: Dashboard,
  },
] as const

const items = [
  '仪表盘入口已经准备好，后续可以继续拆成 overview、users、settings 等路由。',
  '默认使用独立端口，便于与 web 应用并行开发。',
  '页面壳层已经接入共享 token，后续接入表格、筛选和表单时可以直接复用设计语言。',
] as const

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
      <Surface
        className="overflow-hidden rounded-[28px] bg-(--mst-color-bg-surface) p-6 md:p-9"
        style={{
          boxShadow: 'var(--mst-shadow-lg)',
        }}
      >
        <div className="max-w-4xl">
          <span className="inline-flex items-center rounded-full border border-(--mst-color-border-default) bg-(--mst-color-bg-elevated) px-4 py-2 text-sm font-semibold tracking-[0.12em] text-(--mst-color-primary) uppercase">
            apps/admin
          </span>
          <h1 className="mt-5 text-5xl leading-[1.02] font-bold tracking-[-0.04em] text-(--mst-color-text-primary) md:text-6xl">
            后台管理端模板已完成初始化
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-(--mst-color-text-secondary) md:text-lg">
            这里适合继续扩展成数据概览、内容审核、用户管理或系统配置后台，并与前台共享统一主题能力。
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon

            return (
              <Surface
                className="rounded-(--mst-radius-xl) bg-(--mst-color-bg-elevated) p-6 shadow-none"
                key={metric.label}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-sm text-(--mst-color-text-muted)">
                      {metric.label}
                    </span>
                    <strong className="mt-3 block text-4xl leading-none font-semibold text-(--mst-color-text-primary)">
                      {metric.value}
                    </strong>
                  </div>
                  <span className="flex size-11 items-center justify-center rounded-full bg-(--mst-color-primary) text-white shadow-(--mst-shadow-sm)">
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm text-(--mst-color-text-secondary)">
                  {metric.description}
                </p>
              </Surface>
            )
          })}
        </div>
      </Surface>

      <Surface className="mt-6 rounded-[28px] p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-(--mst-color-text-primary)">
          下一步可以直接接入
        </h2>
        <div className="mt-5 grid gap-4">
          {items.map((item) => (
            <Surface
              className="rounded-(--mst-radius-xl) bg-(--mst-color-bg-elevated) p-5 shadow-none"
              key={item}
            >
              <p className="leading-7 text-(--mst-color-text-secondary)">
                {item}
              </p>
            </Surface>
          ))}
        </div>
      </Surface>
    </main>
  )
}
