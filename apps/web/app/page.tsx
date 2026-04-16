import Link from 'next/link'
import {
  AppBrand,
  ChevronRight,
  CircleCheck,
  Sparkles,
  Surface,
} from '@mianshitong/ui'
import { HomePageDemoCarousel, HomePageHeaderActions } from '@/components'
import { getHomePageProps } from './get-home-page-props'

export default async function HomePage() {
  const { content, userEmail } = await getHomePageProps()

  return (
    <div className="min-h-screen">
      <header>
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pt-5">
          <div className="flex items-center justify-between gap-3 rounded-full px-3 py-2 bg-transparent dark:border-white/10 md:rounded-none md:border-0 md:px-0 md:py-0">
            <AppBrand
              className="min-w-0 gap-2.5 sm:gap-3"
              labelClassName="text-lg"
              logoClassName="rounded-xl shadow-(--mst-shadow-sm) sm:size-9"
            />
            <HomePageHeaderActions userEmail={userEmail} />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--mst-color-border-default) bg-slate-900/4 px-3 py-1 text-sm text-(--mst-color-text-secondary) dark:bg-white/6">
            <Sparkles className="size-4 text-(--mst-color-primary)" />
            <span>{content.header.badge}</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-balance text-(--mst-color-text-primary) md:text-6xl">
            {content.header.titlePrefix}
            <span className="text-(--mst-color-primary)">
              {content.header.titleHighlight}
            </span>
            {content.header.titleSuffix}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-balance text-(--mst-color-text-secondary) md:text-xl">
            {content.header.description}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-(--mst-color-primary) px-8 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
              href="/chat"
            >
              {content.header.primaryActionLabel}
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8 md:gap-6">
            {content.highlights.map((item) => (
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
            {content.featuresSection.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-balance text-(--mst-color-text-secondary)">
            {content.featuresSection.description}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {content.features.map((item) => {
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
              {content.demosSection.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-balance text-(--mst-color-text-secondary)">
              {content.demosSection.description}
            </p>
          </div>

          <HomePageDemoCarousel demos={content.demos} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col space-y-6 rounded-lg bg-(--mst-color-primary) p-8 text-center text-white shadow-(--mst-shadow-sm) md:p-12">
          <h2 className="text-3xl font-bold text-balance md:text-4xl">
            {content.cta.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-balance text-white/90">
            {content.cta.description}
          </p>
          <div className="flex pt-4">
            <Link
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-white px-8 text-sm font-semibold text-(--mst-color-primary) transition-colors hover:bg-slate-100"
              href="/chat"
            >
              {content.cta.buttonLabel}
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
                {content.footer.copyright}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
