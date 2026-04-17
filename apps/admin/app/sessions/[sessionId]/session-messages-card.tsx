'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Drawer,
  Tag,
  TypographyParagraph,
  TypographyText,
} from '@mianshitong/ui'
import type { AdminSessionMessageDetail } from '@/server/session/service'

const PREVIEW_MESSAGE_COUNT = 3
const PREVIEW_CONTAINER_MAX_HEIGHT_CLASS = 'max-h-[520px]'

function getMessageRoleLabel(role: AdminSessionMessageDetail['role']) {
  return role === 'user' ? '用户' : 'AI'
}

function getMessageRoleColor(role: AdminSessionMessageDetail['role']) {
  return role === 'user' ? 'blue' : 'green'
}

function SessionMessageBlock({
  message,
}: {
  message: AdminSessionMessageDetail
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[#111827]">消息记录</span>
        <TypographyText className="text-xs text-[#9ca3af]" code>
          {message.id}
        </TypographyText>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tag color={getMessageRoleColor(message.role)}>
          {getMessageRoleLabel(message.role)}
        </Tag>
        <TypographyText className="text-xs text-[#6b7280]">
          {message.createdAtLabel}
        </TypographyText>
        {message.completionStatus ? (
          <Tag
            color={message.completionStatus === 'completed' ? 'green' : 'gold'}
          >
            {message.completionStatus === 'completed' ? '完成' : '中断'}
          </Tag>
        ) : null}
        {message.feedback ? (
          <Tag color={message.feedback === 'like' ? 'blue' : 'red'}>
            {message.feedback === 'like' ? '赞' : '踩'}
          </Tag>
        ) : null}
      </div>

      <TypographyParagraph className="mb-0! whitespace-pre-wrap wrap-break-word text-sm leading-7 text-[#111827]">
        {message.content}
      </TypographyParagraph>
    </div>
  )
}

export function SessionMessagesCard({
  messages,
}: {
  messages: AdminSessionMessageDetail[]
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const previewMessages = useMemo(
    () => messages.slice(-PREVIEW_MESSAGE_COUNT),
    [messages]
  )

  return (
    <>
      <Card
        className="flex h-full min-h-0 flex-col border-[#e5e7eb] shadow-none"
        extra={
          messages.length > 0 ? (
            <Button onClick={() => setDrawerOpen(true)} variant="secondary">
              查看完整上下文
            </Button>
          ) : null
        }
        styles={{
          body: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            minHeight: 0,
            padding: 0,
          },
        }}
        title="对话记录"
      >
        {messages.length === 0 ? (
          <div className="px-6 py-8">
            <TypographyText type="secondary">暂无消息。</TypographyText>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-[#f3f4f6] px-6 py-4">
              <TypographyText className="text-sm text-[#6b7280]">
                当前页仅预览最近 {previewMessages.length}{' '}
                条消息，完整上下文请在右侧抽屉中查看。
              </TypographyText>
            </div>
            <div
              className={`${PREVIEW_CONTAINER_MAX_HEIGHT_CLASS} min-h-0 flex-1 overflow-y-auto overscroll-y-contain`}
            >
              <div className="divide-y divide-[#f3f4f6]">
                {previewMessages.map((message) => (
                  <div className="px-6 py-5" key={message.id}>
                    <SessionMessageBlock message={message} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Drawer
        destroyOnHidden
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{
          body: {
            overflow: 'hidden',
            padding: 0,
          },
        }}
        title={`完整上下文（${messages.length} 条）`}
        width={920}
      >
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto overscroll-y-contain">
          <div className="divide-y divide-[#f3f4f6]">
            {messages.map((message) => (
              <div className="px-6 py-5" key={message.id}>
                <SessionMessageBlock message={message} />
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </>
  )
}
