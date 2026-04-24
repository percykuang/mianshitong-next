import {
  type ChatPageBootstrapData,
  getChatPageBootstrapData,
} from '@/server/chat'

import { normalizeRouteSessionId } from './utils'

export async function getChatPageProps(
  initialSelectedSessionId: string | null
): Promise<ChatPageBootstrapData> {
  return getChatPageBootstrapData(
    normalizeRouteSessionId(initialSelectedSessionId)
  )
}
