import { getCurrentUser } from '@/server/auth-session'
import { ChatShell } from './chat-shell'

export default async function ChatPage() {
  const currentUser = await getCurrentUser()

  return <ChatShell userEmail={currentUser?.email ?? null} />
}
