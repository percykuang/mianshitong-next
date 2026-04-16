import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)

const KEY_LENGTH = 64
const HASH_PREFIX = 'scrypt'

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer

  return [HASH_PREFIX, salt, derivedKey.toString('hex')].join('$')
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [prefix, salt, storedHash] = passwordHash.split('$')

  if (prefix !== HASH_PREFIX || !salt || !storedHash) {
    return false
  }

  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  const storedKey = Buffer.from(storedHash, 'hex')

  if (storedKey.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(storedKey, derivedKey)
}
