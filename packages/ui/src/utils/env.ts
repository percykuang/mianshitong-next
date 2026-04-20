interface ProcessLike {
  env?: {
    NODE_ENV?: string
  }
}

function readNodeEnv() {
  const currentGlobal = globalThis as typeof globalThis & {
    process?: ProcessLike
  }

  return currentGlobal.process?.env?.NODE_ENV
}

export function isDevelopmentEnv() {
  const nodeEnv = readNodeEnv()

  return typeof nodeEnv === 'string' && nodeEnv !== 'production'
}
