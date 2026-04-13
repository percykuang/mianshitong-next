import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@mianshitong/db'

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
  // 数据库只保存 token 哈希值，避免明文 session 泄露后可直接复用。
  return createHash('sha256').update(sessionToken).digest('hex')
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

export async function findUserById(id: string) {
  return prisma.authUser.findUnique({
    where: { id },
  })
}

export async function createUser(input: {
  email: string
  passwordHash: string
}) {
  return prisma.authUser.create({
    data: input,
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

  // 读取时顺手清理已过期 session，避免库里积压失效登录态。
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

export async function deleteExpiredSessions() {
  await prisma.authSession.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  })
}
