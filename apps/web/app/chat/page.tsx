import {
  getChatModelOptions,
  getChatModelRuntimeInfo,
  getDefaultChatModelId,
  type ChatModelId,
} from '@mianshitong/providers'
import { getCurrentUser } from '@/server/auth-session'
import { ChatShell } from './chat-shell'

export default async function ChatPage() {
  const currentUser = await getCurrentUser()
  const initialModelOptions = getChatModelOptions()
  const initialRuntimeDebugInfoByModelId: Record<
    ChatModelId,
    ReturnType<typeof getChatModelRuntimeInfo>
  > = Object.fromEntries(
    initialModelOptions.map((model) => [
      model.id,
      getChatModelRuntimeInfo(model.id),
    ])
  ) as Record<ChatModelId, ReturnType<typeof getChatModelRuntimeInfo>>

  return (
    <ChatShell
      initialModelOptions={initialModelOptions}
      initialSelectedModelId={getDefaultChatModelId()}
      initialRuntimeDebugInfoByModelId={initialRuntimeDebugInfoByModelId}
      userEmail={currentUser?.email ?? null}
    />
  )
}
