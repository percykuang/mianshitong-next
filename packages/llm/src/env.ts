import { config as loadDotenv } from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'

let envInitialized = false

function resolveWorkspaceRoot(startDir: string) {
  let currentDir = path.resolve(startDir)

  while (true) {
    if (fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir
    }

    const parentDir = path.dirname(currentDir)

    if (parentDir === currentDir) {
      return null
    }

    currentDir = parentDir
  }
}

function collectEnvFiles(baseDir: string, nodeEnv: string) {
  const candidates = [
    `.env.${nodeEnv}.local`,
    '.env.local',
    `.env.${nodeEnv}`,
    '.env',
  ]

  return candidates
    .map((name) => path.join(baseDir, name))
    .filter((filePath) => fs.existsSync(filePath))
}

function initializeEnv() {
  if (envInitialized) {
    return
  }

  envInitialized = true

  const cwd = process.cwd()
  const nodeEnv = process.env.NODE_ENV?.trim() || 'development'
  const workspaceRoot = resolveWorkspaceRoot(cwd)
  const envPaths = [
    ...collectEnvFiles(cwd, nodeEnv),
    ...(workspaceRoot && workspaceRoot !== cwd
      ? collectEnvFiles(workspaceRoot, nodeEnv)
      : []),
  ]

  if (envPaths.length === 0) {
    return
  }

  loadDotenv({
    path: envPaths,
    override: false,
    quiet: true,
  })
}

initializeEnv()

export function readEnvString(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export function normalizeOpenAICompatibleBaseUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  return normalizedBaseUrl.endsWith('/v1')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/v1`
}
