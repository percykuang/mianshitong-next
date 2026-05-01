import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'

import { readEnvString } from '../env'

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_IV_BYTES = 12
const ENCRYPTION_VERSION = 'v1'

function getModelConfigEncryptionKey() {
  const secret = readEnvString('MODEL_CONFIG_SECRET')

  if (!secret) {
    return null
  }

  return createHash('sha256').update(secret).digest()
}

export function maskApiKey(apiKey: string) {
  const trimmedApiKey = apiKey.trim()

  if (trimmedApiKey.length <= 4) {
    return trimmedApiKey ? `••••${trimmedApiKey}` : '已配置'
  }

  return `••••${trimmedApiKey.slice(-4)}`
}

export function encryptApiKey(apiKey: string) {
  const key = getModelConfigEncryptionKey()

  if (!key) {
    return {
      ciphertext: null,
      error: 'missing_secret' as const,
    }
  }

  const iv = randomBytes(ENCRYPTION_IV_BYTES)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(apiKey, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return {
    ciphertext: [
      ENCRYPTION_VERSION,
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext.toString('base64'),
    ].join('.'),
    error: null,
  }
}

export function decryptApiKey(ciphertext: string) {
  const key = getModelConfigEncryptionKey()

  if (!key) {
    return {
      apiKey: null,
      error: 'missing_secret' as const,
    }
  }

  const [version, ivText, authTagText, payloadText] = ciphertext.split('.')

  if (
    version !== ENCRYPTION_VERSION ||
    !ivText ||
    !authTagText ||
    !payloadText
  ) {
    return {
      apiKey: null,
      error: 'invalid_ciphertext' as const,
    }
  }

  try {
    const decipher = createDecipheriv(
      ENCRYPTION_ALGORITHM,
      key,
      Buffer.from(ivText, 'base64')
    )

    decipher.setAuthTag(Buffer.from(authTagText, 'base64'))

    const apiKey = Buffer.concat([
      decipher.update(Buffer.from(payloadText, 'base64')),
      decipher.final(),
    ]).toString('utf8')

    return {
      apiKey,
      error: null,
    }
  } catch {
    return {
      apiKey: null,
      error: 'invalid_ciphertext' as const,
    }
  }
}
