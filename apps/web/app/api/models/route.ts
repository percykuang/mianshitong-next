import {
  getChatModelOptions,
  getDefaultChatModelId,
} from '@mianshitong/providers'

export async function GET() {
  return Response.json({
    defaultModelId: getDefaultChatModelId(),
    models: getChatModelOptions(),
  })
}
