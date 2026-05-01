import type { ChatModelOption } from '@mianshitong/llm'

export type ChatModelCatalogStatus = 'loading' | 'ready' | 'empty' | 'error'

interface ChatModelCatalogStateBase {
  message: string
  models: readonly ChatModelOption[]
  selectedModelId: string
}

export type ChatModelCatalogState =
  | (ChatModelCatalogStateBase & {
      status: 'loading'
    })
  | (ChatModelCatalogStateBase & {
      status: 'ready'
    })
  | (ChatModelCatalogStateBase & {
      status: 'empty'
    })
  | (ChatModelCatalogStateBase & {
      status: 'error'
    })

export type { ChatModelOption }
