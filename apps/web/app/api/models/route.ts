import { getChatModelOptions, getDefaultChatModelId } from '@mianshitong/llm'

export async function GET() {
  return Response.json({
    defaultModelId: getDefaultChatModelId(),
    models: getChatModelOptions(),
  })
}
