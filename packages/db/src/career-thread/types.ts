export interface DbCareerThreadStateRecord {
  state: unknown
  version: number
}

export interface DbUpsertCareerThreadStateInput {
  chatSessionId: string
  state: unknown
  version: number
}
