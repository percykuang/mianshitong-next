import { getResolvedChatModelCatalogState } from '@/server/chat'

export async function GET() {
  const modelCatalog = await getResolvedChatModelCatalogState()

  return Response.json(modelCatalog, {
    status: modelCatalog.status === 'error' ? 503 : 200,
  })
}
