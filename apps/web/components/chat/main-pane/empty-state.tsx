'use client'

import { Info, Loader } from '@mianshitong/ui'

interface ChatEmptyStateProps {
  message?: string
  onRetry?: () => void
  status?: 'default' | 'empty' | 'error' | 'loading'
}

export function ChatEmptyState({
  message = '',
  onRetry,
  status = 'default',
}: ChatEmptyStateProps) {
  if (status === 'loading') {
    return (
      <div className="mx-auto mt-8 flex min-h-full w-full max-w-3xl flex-col justify-center px-4 text-left md:mt-20 md:px-8">
        <div className="inline-flex items-center gap-3 text-(--mst-color-primary)">
          <Loader className="size-5 animate-spin" />
          <span className="text-lg font-medium">正在加载模型配置</span>
        </div>
        <div className="mt-3 max-w-2xl text-sm leading-relaxed text-(--mst-color-text-secondary) md:text-base">
          加载完成后即可开始对话。
        </div>
      </div>
    )
  }

  if (status === 'empty' || status === 'error') {
    return (
      <div className="mx-auto mt-8 flex min-h-full w-full max-w-3xl flex-col justify-center px-4 text-left md:mt-20 md:px-8">
        <div className="inline-flex items-center gap-3 text-(--mst-color-primary)">
          <Info className="size-5" />
          <span className="text-lg font-medium">
            {status === 'empty'
              ? '当前系统还没有可用模型'
              : '模型服务暂时不可用'}
          </span>
        </div>
        <div className="mt-3 max-w-2xl text-sm leading-relaxed text-(--mst-color-text-secondary) md:text-base">
          {message}
        </div>
        {onRetry ? (
          <div className="mt-5">
            <button
              className="inline-flex cursor-pointer items-center rounded-full border border-(--mst-color-border-default) px-4 py-2 text-sm font-medium text-(--mst-color-text-primary) transition-colors duration-200 hover:bg-slate-900/4 dark:hover:bg-white/6"
              onClick={onRetry}
              type="button"
            >
              重新加载模型
            </button>
          </div>
        ) : null}
      </div>
    )
  }

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
