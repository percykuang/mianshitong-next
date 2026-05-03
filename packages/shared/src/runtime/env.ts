interface ProcessLike {
  env?: {
    NODE_ENV?: string
  }
}

function readNodeEnvFromGlobal() {
  const currentGlobal = globalThis as typeof globalThis & {
    process?: ProcessLike
  }

  return currentGlobal.process?.env?.NODE_ENV?.trim()
}

export function getNodeEnv() {
  return readNodeEnvFromGlobal() || 'development'
}

export function isDevelopmentEnv(nodeEnv = getNodeEnv()) {
  return nodeEnv === 'development'
}

export function isProductionEnv(nodeEnv = getNodeEnv()) {
  return nodeEnv === 'production' || nodeEnv === 'prod'
}

export function isTestEnv(nodeEnv = getNodeEnv()) {
  return nodeEnv === 'test'
}
