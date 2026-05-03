import { createHash, randomBytes } from 'node:crypto'

import type { DbClient, PrismaClientInstance } from '../client-types'
import type {
  DbAuthSessionResult,
  DbListAuthUsersForAdminInput,
  DbListAuthUsersForAdminResult,
} from './types'

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

function canRunTransaction(client: DbClient): client is PrismaClientInstance {
  return '$transaction' in client
}

function createAdminUserSortOrderBy(
  input: Pick<DbListAuthUsersForAdminInput, 'sortBy' | 'sortOrder'>
) {
  if (input.sortBy === 'sessionCount') {
    return {
      chatSessions: {
        _count: input.sortOrder,
      },
    }
  }

  if (input.sortBy === 'email') {
    return {
      email: input.sortOrder,
    }
  }

  return {
    createdAt: input.sortOrder,
  }
}

function findAuthUserByEmail(client: DbClient, email: string) {
  return client.authUser.findUnique({
    where: { email },
  })
}

function findAuthUserById(client: DbClient, id: string) {
  return client.authUser.findUnique({
    where: { id },
  })
}

async function listAuthUsersForAdmin(
  client: DbClient,
  input: DbListAuthUsersForAdminInput
): Promise<DbListAuthUsersForAdminResult> {
  const [users, total] = await Promise.all([
    client.authUser.findMany({
      skip: input.skip,
      take: input.take,
      orderBy: createAdminUserSortOrderBy(input),
      select: {
        id: true,
        email: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            dailyModelQuota: true,
          },
        },
        _count: {
          select: {
            chatSessions: true,
          },
        },
      },
    }),
    client.authUser.count(),
  ])

  return {
    items: users.map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      actor: user.actor,
      sessionCount: user._count.chatSessions,
    })),
    total,
  }
}

function createAuthUser(
  client: DbClient,
  input: {
    email: string
    passwordHash: string
  }
) {
  return client.authUser.create({
    data: input,
  })
}

async function createAuthUserSession(
  client: DbClient,
  userId: string
): Promise<DbAuthSessionResult> {
  const sessionToken = createRawSessionToken()
  const expiresAt = getSessionExpiryDate()

  await client.authSession.create({
    data: {
      userId,
      expiresAt,
      sessionTokenHash: hashSessionToken(sessionToken),
    },
  })

  return {
    sessionToken,
    expiresAt,
    maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
  }
}

async function findAuthUserBySessionToken(
  client: DbClient,
  sessionToken: string
) {
  const session = await client.authSession.findUnique({
    where: getSessionTokenHashWhere(sessionToken),
    include: {
      user: true,
    },
  })

  if (!session) {
    return null
  }

  if (isSessionExpired(session.expiresAt)) {
    await client.authSession.delete({
      where: {
        id: session.id,
      },
    })

    return null
  }

  return session.user
}

async function deleteAuthUserSessionByToken(
  client: DbClient,
  sessionToken: string
) {
  await client.authSession.deleteMany({
    where: getSessionTokenHashWhere(sessionToken),
  })
}

async function deleteExpiredAuthUserSessions(client: DbClient) {
  await client.authSession.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  })
}

async function deleteAuthUserWithActorByIdWithinClient(
  client: DbClient,
  userId: string
) {
  await client.userActor.deleteMany({
    where: {
      authUserId: userId,
    },
  })

  await client.authUser.delete({
    where: {
      id: userId,
    },
  })
}

async function deleteAuthUserWithActorById(client: DbClient, userId: string) {
  if (canRunTransaction(client)) {
    await client.$transaction(async (tx) => {
      await deleteAuthUserWithActorByIdWithinClient(tx, userId)
    })

    return
  }

  await deleteAuthUserWithActorByIdWithinClient(client, userId)
}

export function createAuthUserDb(client: DbClient) {
  return {
    findByEmail(email: string) {
      return findAuthUserByEmail(client, email)
    },
    findById(id: string) {
      return findAuthUserById(client, id)
    },
    listForAdmin(input: DbListAuthUsersForAdminInput) {
      return listAuthUsersForAdmin(client, input)
    },
    create(input: { email: string; passwordHash: string }) {
      return createAuthUser(client, input)
    },
    createSession(userId: string) {
      return createAuthUserSession(client, userId)
    },
    findBySessionToken(sessionToken: string) {
      return findAuthUserBySessionToken(client, sessionToken)
    },
    deleteSessionByToken(sessionToken: string) {
      return deleteAuthUserSessionByToken(client, sessionToken)
    },
    deleteExpiredSessions() {
      return deleteExpiredAuthUserSessions(client)
    },
    deleteWithActorById(userId: string) {
      return deleteAuthUserWithActorById(client, userId)
    },
  }
}

export type AuthUserDb = ReturnType<typeof createAuthUserDb>
