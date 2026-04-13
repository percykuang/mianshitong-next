import { ChatPageClient } from '../chat-page-client'
import { getChatPageProps } from '../get-chat-page-props'

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function ChatSessionPage({
  params,
}: ChatSessionPageProps) {
  const { sessionId } = await params

  return <ChatPageClient {...await getChatPageProps(sessionId)} />
}
