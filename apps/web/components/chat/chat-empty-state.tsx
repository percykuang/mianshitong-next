'use client'

export function ChatEmptyState() {
  return (
    <div className="mx-auto mt-4 flex min-h-full w-full max-w-3xl flex-col justify-center px-4 text-left md:mt-16 md:px-8">
      <div
        className="text-4xl leading-none font-semibold tracking-tighter text-(--mst-color-primary) md:text-5xl"
        style={{ animation: 'chat-shell-fade-up 320ms ease-out both' }}
      >
        面试通
      </div>
      <div
        className="mt-4 max-w-2xl text-xl leading-relaxed tracking-tight text-(--mst-color-text-secondary) md:text-2xl"
        style={{ animation: 'chat-shell-fade-up 520ms ease-out both' }}
      >
        AI 智能面试官，优化简历，模拟面试
      </div>
    </div>
  )
}
