import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@mianshitong/db'

const SESSION_TOKEN_BYTE_LENGTH = 32
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000

function hashSessionToken(sessionToken: string) {
  return createHash('sha256').update(sessionToken).digest('hex')
}

function getSessionTokenHashWhere(sessionToken: string) {
  return {
    sessionTokenHash: hashSessionToken(sessionToken),
  }
}

function isSessionExpired(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now()
}

export function createRawSessionToken() {
  return randomBytes(SESSION_TOKEN_BYTE_LENGTH).toString('base64url')
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_MAX_AGE_MS)
}

export async function findUserByEmail(email: string) {
  return prisma.authUser.findUnique({
    where: { email },
  })
}

export async function createAuthSession(userId: string) {
  const sessionToken = createRawSessionToken()
  const expiresAt = getSessionExpiryDate()

  await prisma.authSession.create({
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

export async function findUserBySessionToken(sessionToken: string) {
  const session = await prisma.authSession.findUnique({
    where: getSessionTokenHashWhere(sessionToken),
    include: {
      user: true,
    },
  })

  if (!session) {
    return null
  }

  if (isSessionExpired(session.expiresAt)) {
    await prisma.authSession.delete({
      where: {
        id: session.id,
      },
    })

    return null
  }

  return session.user
}

export async function deleteSessionByToken(sessionToken: string) {
  await prisma.authSession.deleteMany({
    where: getSessionTokenHashWhere(sessionToken),
  })
}
