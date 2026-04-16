import {
  getChatPageBootstrapData,
  type ChatPageBootstrapData,
} from '@/server/chat/services'
import { normalizeRouteSessionId } from './utils'

export async function getChatPageProps(
  initialSelectedSessionId: string | null
): Promise<ChatPageBootstrapData> {
  return getChatPageBootstrapData(
    normalizeRouteSessionId(initialSelectedSessionId)
  )
}
