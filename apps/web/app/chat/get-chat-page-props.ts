import {
  getChatModelOptions,
  getChatModelRuntimeInfo,
  getDefaultChatModelId,
  type ChatModelId,
} from '@mianshitong/providers'
import { type ChatSessionPreview } from '@/components'
import { getCurrentChatActor } from '@/server/chat-actor'
import { listChatSessionsByActor } from '@/server/chat-session-repository'
import { normalizeRouteSessionId } from './utils'

export async function getChatPageProps(
  initialSelectedSessionId: string | null
) {
  const actor = await getCurrentChatActor({ createGuest: false })
  const persistenceEnabled = true
  const initialSessions: ChatSessionPreview[] = actor
    ? await listChatSessionsByActor(actor.id)
    : []
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

  return {
    initialSessions,
    initialModelOptions,
    initialSelectedModelId: getDefaultChatModelId(),
    initialRuntimeDebugInfoByModelId,
    initialSelectedSessionId: normalizeRouteSessionId(initialSelectedSessionId),
    persistenceEnabled,
    userEmail: actor?.authUserId ? actor.displayName : null,
  }
}
