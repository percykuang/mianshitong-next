import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

type EnvMode = 'development' | 'test' | 'production'

const DATABASE_URL_ENV_KEY = 'DATABASE_URL'
const WORKSPACE_ROOT_MARKER = 'pnpm-workspace.yaml'

let cachedProjectRootDir: string | null = null
let hasLoadedProjectEnv = false

function getEnvMode(): EnvMode {
  if (process.env.NODE_ENV === 'production') {
    return 'production'
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test'
  }

  return 'development'
}

function findWorkspaceRootDir(startDir: string) {
  let currentDir = startDir

  while (true) {
    if (existsSync(join(currentDir, WORKSPACE_ROOT_MARKER))) {
      return currentDir
    }

    const parentDir = dirname(currentDir)

    if (parentDir === currentDir) {
      return startDir
    }

    currentDir = parentDir
  }
}

function getProjectRootDir() {
  if (cachedProjectRootDir) {
    return cachedProjectRootDir
  }

  // Prisma CLI 可能从 packages/db 启动，Next 运行时又可能从 apps/web 启动，
  // 所以这里统一从当前工作目录向上找到 monorepo 根目录。
  cachedProjectRootDir = findWorkspaceRootDir(process.cwd())
  return cachedProjectRootDir
}

function getEnvFilePaths(rootDir: string, envMode: EnvMode) {
  const envFilePaths = [join(rootDir, `.env.${envMode}.local`)]

  if (envMode !== 'test') {
    envFilePaths.push(join(rootDir, '.env.local'))
  }

  envFilePaths.push(join(rootDir, `.env.${envMode}`))
  envFilePaths.push(join(rootDir, '.env'))

  return envFilePaths
}

function loadProjectEnvOnce() {
  if (hasLoadedProjectEnv) {
    return
  }

  const projectRootDir = getProjectRootDir()
  const envMode = getEnvMode()

  // Node 的 loadEnvFile 不会覆盖已存在的 process.env，
  // 因此这里按高优先级到低优先级加载，行为尽量贴近 Next.js。
  for (const envFilePath of getEnvFilePaths(projectRootDir, envMode)) {
    if (existsSync(envFilePath)) {
      process.loadEnvFile(envFilePath)
    }
  }

  hasLoadedProjectEnv = true
}

function requireEnvValue(key: string) {
  const value = process.env[key]

  if (value) {
    return value
  }

  throw new Error(`${key} is required`)
}

export function getRequiredDatabaseUrl() {
  loadProjectEnvOnce()
  return requireEnvValue(DATABASE_URL_ENV_KEY)
}
