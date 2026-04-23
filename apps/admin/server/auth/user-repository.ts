import { prisma } from '@mianshitong/db'
import { createHash, randomBytes } from 'node:crypto'

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

export async function findUserByEmail(email: string) {
  return prisma.adminUser.findUnique({
    where: { email },
  })
}

export async function createAuthSession(adminUserId: string) {
  const sessionToken = createRawSessionToken()
  const expiresAt = getSessionExpiryDate()

  await prisma.adminSession.create({
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

export async function findUserBySessionToken(sessionToken: string) {
  const session = await prisma.adminSession.findUnique({
    where: getSessionTokenHashWhere(sessionToken),
    include: {
      adminUser: true,
    },
  })

  if (!session) {
    return null
  }

  if (isSessionExpired(session.expiresAt)) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    })

    return null
  }

  return session.adminUser
}

export async function deleteSessionByToken(sessionToken: string) {
  await prisma.adminSession.deleteMany({
    where: getSessionTokenHashWhere(sessionToken),
  })
}

export async function deleteExpiredSessions() {
  await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  })
}
