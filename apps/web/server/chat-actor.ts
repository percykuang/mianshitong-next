import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from '@mianshitong/db'
import { getCurrentUser } from './auth-session'

const GUEST_COOKIE_NAME = 'mst_guest_session'
const GUEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const ACTOR_LAST_SEEN_REFRESH_MS = 60_000
const GUEST_COOKIE_PATH = '/'

export type ChatActorType = 'guest' | 'registered'

export interface ChatActor {
  authUserId: string | null
  displayName: string
  id: string
  type: ChatActorType
}

interface UserActorRecord {
  authUserId: string | null
  displayName: string
  guestTokenHash: string | null
  id: string
  lastSeenAt: Date
  type: ChatActorType
}

interface ChatActorPrismaClient {
  userActor: {
    create(args: {
      data: {
        authUserId?: string
        displayName: string
        guestTokenHash?: string
        id?: string
        lastSeenAt: Date
        type: ChatActorType
      }
    }): Promise<UserActorRecord>
    findUnique(args: {
      where:
        | {
            authUserId: string
          }
        | {
            guestTokenHash: string
          }
    }): Promise<UserActorRecord | null>
    update(args: {
      where: {
        id: string
      }
      data: {
        displayName?: string
        lastSeenAt: Date
        type?: ChatActorType
      }
    }): Promise<UserActorRecord>
  }
}

const chatActorPrisma = prisma as unknown as ChatActorPrismaClient

function hashGuestToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function createGuestToken() {
  return randomBytes(24).toString('base64url')
}

function createGuestDisplayName(tokenHash: string) {
  return `guest-${tokenHash.slice(0, 8)}`
}

function shouldRefreshActorLastSeen(lastSeenAt: Date) {
  return lastSeenAt.getTime() < Date.now() - ACTOR_LAST_SEEN_REFRESH_MS
}

function createActorLastSeenAt() {
  return new Date()
}

function buildGuestCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: GUEST_COOKIE_PATH,
    maxAge: GUEST_COOKIE_MAX_AGE_SECONDS,
  }
}

async function touchActorLastSeen(actorId: string) {
  await chatActorPrisma.userActor.update({
    where: { id: actorId },
    data: { lastSeenAt: createActorLastSeenAt() },
  })
}

async function getGuestTokenFromCookies() {
  const cookieStore = await cookies()
  return cookieStore.get(GUEST_COOKIE_NAME)?.value ?? ''
}

async function ensureRegisteredActor(input: { email: string; userId: string }) {
  const existing = await chatActorPrisma.userActor.findUnique({
    where: {
      authUserId: input.userId,
    },
  })

  if (existing) {
    const needsRefresh =
      existing.type !== 'registered' ||
      existing.displayName !== input.email ||
      shouldRefreshActorLastSeen(existing.lastSeenAt)

    if (!needsRefresh) {
      return existing
    }

    return chatActorPrisma.userActor.update({
      where: {
        id: existing.id,
      },
      data: {
        type: 'registered',
        displayName: input.email,
        lastSeenAt: createActorLastSeenAt(),
      },
    })
  }

  return chatActorPrisma.userActor.create({
    data: {
      id: input.userId,
      type: 'registered',
      displayName: input.email,
      authUserId: input.userId,
      lastSeenAt: createActorLastSeenAt(),
    },
  })
}

async function findGuestActorByToken(token: string) {
  const actor = await chatActorPrisma.userActor.findUnique({
    where: {
      guestTokenHash: hashGuestToken(token),
    },
  })

  if (!actor || actor.type !== 'guest') {
    return null
  }

  if (shouldRefreshActorLastSeen(actor.lastSeenAt)) {
    await touchActorLastSeen(actor.id)
  }

  return actor
}

async function createGuestActorWithCookie() {
  const token = createGuestToken()
  const tokenHash = hashGuestToken(token)
  const actor = await chatActorPrisma.userActor.create({
    data: {
      type: 'guest',
      displayName: createGuestDisplayName(tokenHash),
      guestTokenHash: tokenHash,
      lastSeenAt: createActorLastSeenAt(),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(GUEST_COOKIE_NAME, token, buildGuestCookieOptions())

  return actor
}

function toChatActor(actor: UserActorRecord): ChatActor {
  return {
    id: actor.id,
    type: actor.type,
    displayName: actor.displayName,
    authUserId: actor.authUserId,
  }
}

export async function getCurrentChatActor(options?: { createGuest?: boolean }) {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    const actor = await ensureRegisteredActor({
      userId: currentUser.id,
      email: currentUser.email,
    })

    return toChatActor(actor)
  }

  const createGuest = options?.createGuest ?? false
  const token = await getGuestTokenFromCookies()

  if (token) {
    const actor = await findGuestActorByToken(token)

    if (actor) {
      return toChatActor(actor)
    }
  }

  if (!createGuest) {
    return null
  }

  return toChatActor(await createGuestActorWithCookie())
}
