import { createHash, randomBytes } from 'node:crypto'

import type { DbClient } from '../client-types'
import type { DbAdminSessionResult } from './types'

const SESSION_TOKEN_BYTE_LENGTH = 32
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000

function getSessionTokenHashWhere(sessionToken: string) {
  return {
    sessionTokenHash: hashSessionToken(sessionToken),
  }
}

function isSessionExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now()
}

function hashSessionToken(sessionToken: string) {
  return createHash('sha256').update(sessionToken).digest('hex')
}

function createRawSessionToken() {
  return randomBytes(SESSION_TOKEN_BYTE_LENGTH).toString('base64url')
}

function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_MAX_AGE_MS)
}

function findAdminUserByEmail(client: DbClient, email: string) {
  return client.adminUser.findUnique({
    where: { email },
  })
}

async function createAdminUserSession(
  client: DbClient,
  adminUserId: string
): Promise<DbAdminSessionResult> {
  const sessionToken = createRawSessionToken()
  const expiresAt = getSessionExpiryDate()

  await client.adminSession.create({
    data: {
      adminUserId,
      expiresAt,
      sessionTokenHash: hashSessionToken(sessionToken),
    },
  })

  return {
    expiresAt,
    sessionToken,
    maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
  }
}

async function findAdminUserBySessionToken(
  client: DbClient,
  sessionToken: string
) {
  const session = await client.adminSession.findUnique({
    where: getSessionTokenHashWhere(sessionToken),
    include: {
      adminUser: true,
    },
  })

  if (!session) {
    return null
  }

  if (isSessionExpired(session.expiresAt)) {
    await client.adminSession.delete({
      where: {
        id: session.id,
      },
    })

    return null
  }

  return session.adminUser
}

async function deleteAdminUserSessionByToken(
  client: DbClient,
  sessionToken: string
) {
  await client.adminSession.deleteMany({
    where: getSessionTokenHashWhere(sessionToken),
  })
}

async function deleteExpiredAdminUserSessions(client: DbClient) {
  await client.adminSession.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  })
}

export function createAdminUserDb(client: DbClient) {
  return {
    findByEmail(email: string) {
      return findAdminUserByEmail(client, email)
    },
    createSession(adminUserId: string) {
      return createAdminUserSession(client, adminUserId)
    },
    findBySessionToken(sessionToken: string) {
      return findAdminUserBySessionToken(client, sessionToken)
    },
    deleteSessionByToken(sessionToken: string) {
      return deleteAdminUserSessionByToken(client, sessionToken)
    },
    deleteExpiredSessions() {
      return deleteExpiredAdminUserSessions(client)
    },
  }
}

export type AdminUserDb = ReturnType<typeof createAdminUserDb>
