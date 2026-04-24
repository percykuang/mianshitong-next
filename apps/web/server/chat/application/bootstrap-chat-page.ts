import {
  type ChatModelId,
  getChatModelOptions,
  getDefaultChatModelId,
} from '@mianshitong/llm'

import type { ChatModelOption, ChatSessionPreview } from '@/app/chat/domain'

import { loadCurrentActorChatSessions } from './manage-chat-session'

export interface ChatPageBootstrapData {
  initialModelOptions: readonly ChatModelOption[]
  initialSelectedModelId: ChatModelId
  initialSelectedSessionId: string | null
  initialSessions: ChatSessionPreview[]
  persistenceEnabled: boolean
  userEmail: string | null
}

export async function getChatPageBootstrapData(
  initialSelectedSessionId: string | null
): Promise<ChatPageBootstrapData> {
  const { actor, sessions } = await loadCurrentActorChatSessions({
    createGuest: false,
  })
  const initialModelOptions = getChatModelOptions()

  return {
    initialSessions: sessions,
    initialModelOptions,
    initialSelectedModelId: getDefaultChatModelId(),
    initialSelectedSessionId,
    persistenceEnabled: true,
    userEmail: actor?.authUserId ? actor.displayName : null,
  }
}
