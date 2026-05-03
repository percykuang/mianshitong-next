import type { DbClient } from '../client-types'
import type {
  DbCareerThreadStateRecord,
  DbUpsertCareerThreadStateInput,
} from './types'

interface CareerThreadDelegate {
  deleteMany(input: { where: { chatSessionId: string } }): Promise<unknown>
  findUnique(input: {
    select: { state: boolean; version: boolean }
    where: { chatSessionId: string }
  }): Promise<DbCareerThreadStateRecord | null>
  upsert(input: {
    create: { chatSessionId: string; state: unknown; version: number }
    update: { state: unknown; version: number }
    where: { chatSessionId: string }
  }): Promise<unknown>
}

function getCareerThreadClient(client: DbClient) {
  return (
    client as unknown as {
      careerThread: CareerThreadDelegate
    }
  ).careerThread
}

function findCareerThreadStateRecord(client: DbClient, chatSessionId: string) {
  return getCareerThreadClient(client).findUnique({
    where: {
      chatSessionId,
    },
    select: {
      state: true,
      version: true,
    },
  })
}

function upsertCareerThreadStateRecord(
  client: DbClient,
  input: DbUpsertCareerThreadStateInput
) {
  return getCareerThreadClient(client).upsert({
    where: {
      chatSessionId: input.chatSessionId,
    },
    create: {
      chatSessionId: input.chatSessionId,
      state: input.state,
      version: input.version,
    },
    update: {
      state: input.state,
      version: input.version,
    },
  })
}

function deleteCareerThreadStateRecord(
  client: DbClient,
  chatSessionId: string
) {
  return getCareerThreadClient(client).deleteMany({
    where: {
      chatSessionId,
    },
  })
}

export function createCareerThreadDb(client: DbClient) {
  return {
    findState(chatSessionId: string) {
      return findCareerThreadStateRecord(client, chatSessionId)
    },
    upsertState(input: DbUpsertCareerThreadStateInput) {
      return upsertCareerThreadStateRecord(client, input)
    },
    deleteState(chatSessionId: string) {
      return deleteCareerThreadStateRecord(client, chatSessionId)
    },
  }
}

export type CareerThreadDb = ReturnType<typeof createCareerThreadDb>
