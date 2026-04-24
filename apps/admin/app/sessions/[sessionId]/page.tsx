import {
  Button,
  Card,
  Descriptions,
  type DescriptionsProps,
  Tag,
  TypographyText,
} from '@mianshitong/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAdminSessionDetail } from '@/server'
import { resolveAdminInternalPath } from '@/utils/redirect'

import { SessionMessagesCard } from './session-messages-card'

interface AdminSessionDetailPageProps {
  params: Promise<{ sessionId: string }>
  searchParams: Promise<{
    from?: string | string[]
  }>
}

function getStatusLabel(status: 'completed' | 'interrupted' | 'pending') {
  if (status === 'interrupted') {
    return '已中断'
  }

  if (status === 'pending') {
    return '待完成'
  }

  return '已完成'
}

export default async function AdminSessionDetailPage({
  params,
  searchParams,
}: AdminSessionDetailPageProps) {
  const { sessionId } = await params
  const session = await getAdminSessionDetail(sessionId)
  const resolvedSearchParams = await searchParams
  const backHref = resolveAdminInternalPath(
    resolvedSearchParams.from,
    '/sessions'
  )

  if (!session) {
    notFound()
  }

  const overviewItems: DescriptionsProps['items'] = [
    {
      children: <TypographyText code>{session.id}</TypographyText>,
      key: 'id',
      label: '会话 ID',
    },
    {
      children: session.title || '未命名',
      key: 'title',
      label: '标题',
    },
    {
      children: (
        <Tag color={session.userType === 'guest' ? 'default' : 'blue'}>
          {session.userType === 'guest' ? '访客' : '注册用户'}
        </Tag>
      ),
      key: 'userType',
      label: '用户类型',
    },
    {
      children: session.userEmail ?? (
        <TypographyText type="secondary">访客无邮箱</TypographyText>
      ),
      key: 'userEmail',
      label: '用户邮箱',
    },
    {
      children: <TypographyText code>{session.userId}</TypographyText>,
      key: 'userId',
      label: '用户 ID',
    },
    {
      children: (
        <Tag color={session.status === 'completed' ? 'green' : 'gold'}>
          {getStatusLabel(session.status)}
        </Tag>
      ),
      key: 'status',
      label: '状态',
    },
    {
      children: session.messageCount,
      key: 'messageCount',
      label: '消息数',
    },
    {
      children: session.createdAtLabel,
      key: 'createdAt',
      label: '创建时间',
    },
    {
      children: session.updatedAtLabel,
      key: 'updatedAt',
      label: '更新时间',
    },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <Card
        className="shrink-0 border-[#e5e7eb] shadow-none"
        styles={{ body: { padding: 24 } }}
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[30px] font-semibold tracking-tight text-[#111827]">
                会话详情
              </h1>
            </div>

            <Link href={backHref}>
              <Button variant="secondary">返回会话列表</Button>
            </Link>
          </div>

          <Descriptions
            bordered
            column={2}
            items={overviewItems}
            size="small"
          />
        </div>
      </Card>

      <div className="min-h-0 flex-1">
        <SessionMessagesCard messages={session.messages} />
      </div>
    </div>
  )
}
