import type { ChatSessionPreview } from '@/app/chat/domain'
import type { ChatModelCatalogState } from '@/chat/shared/model-catalog'

import { loadCurrentActorChatSessions } from './manage-chat-session'
import { getResolvedChatModelCatalogState } from './model-catalog'

export interface ChatPageBootstrapData {
  initialModelCatalog: ChatModelCatalogState
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
  const initialModelCatalog = await getResolvedChatModelCatalogState()

  return {
    initialSessions: sessions,
    initialModelCatalog,
    initialSelectedSessionId,
    persistenceEnabled: true,
    userEmail: actor?.authUserId ? actor.displayName : null,
  }
}
