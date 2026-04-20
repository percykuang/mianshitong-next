import {
  type ChatModelId,
  getChatModelOptions,
  getChatModelRuntimeInfo,
  getDefaultChatModelId,
} from '@mianshitong/providers'

import type {
  ChatModelOption,
  ChatRuntimeDebugInfo,
  ChatSessionPreview,
} from '@/app/chat/domain'

import { loadCurrentActorChatSessions } from './session-service'

export interface ChatPageBootstrapData {
  initialModelOptions: readonly ChatModelOption[]
  initialRuntimeDebugInfoByModelId: Record<ChatModelId, ChatRuntimeDebugInfo>
  initialSelectedModelId: ChatModelId
  initialSelectedSessionId: string | null
  initialSessions: ChatSessionPreview[]
  persistenceEnabled: boolean
  userEmail: string | null
}

function buildRuntimeDebugInfoByModelId(
  modelOptions: readonly ChatModelOption[]
): Record<ChatModelId, ChatRuntimeDebugInfo> {
  return Object.fromEntries(
    modelOptions.map((model) => [model.id, getChatModelRuntimeInfo(model.id)])
  ) as Record<ChatModelId, ChatRuntimeDebugInfo>
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
    initialRuntimeDebugInfoByModelId:
      buildRuntimeDebugInfoByModelId(initialModelOptions),
    initialSelectedModelId: getDefaultChatModelId(),
    initialSelectedSessionId,
    persistenceEnabled: true,
    userEmail: actor?.authUserId ? actor.displayName : null,
  }
}
