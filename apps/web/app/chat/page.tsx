import { ChatPageClient } from './chat-page-client'
import { getChatPageProps } from './get-chat-page-props'

export default async function ChatPage() {
  return <ChatPageClient {...await getChatPageProps(null)} />
}
