import { ModelList } from '@/container'
import { listAdminChatModels } from '@/server'

export default async function ModelsPage() {
  const models = await listAdminChatModels()

  return <ModelList models={models} />
}
