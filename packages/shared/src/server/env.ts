import { config as loadDotenv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { getNodeEnv, isProductionEnv, isTestEnv } from '../runtime/env'

type EnvMode = 'development' | 'production' | 'test'

export interface WorkspaceEnvLoaderOptions {
  directories: Array<string | null | undefined>
  includeLocalInTest?: boolean
  nodeEnv?: string
}

function getEnvMode(nodeEnv: string | undefined): EnvMode {
  if (isProductionEnv(nodeEnv)) {
    return 'production'
  }

  if (isTestEnv(nodeEnv)) {
    return 'test'
  }

  return 'development'
}

export function findWorkspaceRoot(startDir: string) {
  let currentDir = resolve(startDir)

  while (true) {
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir
    }

    const parentDir = dirname(currentDir)

    if (parentDir === currentDir) {
      return startDir
    }

    currentDir = parentDir
  }
}

function collectEnvFilePaths(
  baseDir: string,
  envMode: EnvMode,
  includeLocalInTest: boolean
) {
  const envFileKeys =
    envMode === 'production'
      ? ['prod', 'production']
      : envMode === 'development'
        ? ['dev', 'development']
        : ['test']

  const envFilePaths = envFileKeys.map((envFileKey) =>
    join(baseDir, `.env.${envFileKey}.local`)
  )

  if (includeLocalInTest || envMode !== 'test') {
    envFilePaths.push(join(baseDir, '.env.local'))
  }

  envFilePaths.push(
    ...envFileKeys.map((envFileKey) => join(baseDir, `.env.${envFileKey}`))
  )
  envFilePaths.push(join(baseDir, '.env'))

  return envFilePaths.filter((filePath) => existsSync(filePath))
}

export function createWorkspaceEnvLoader(options: WorkspaceEnvLoaderOptions) {
  let hasLoaded = false

  return function loadWorkspaceEnv() {
    if (hasLoaded) {
      return
    }

    hasLoaded = true

    const envMode = getEnvMode(options.nodeEnv ?? getNodeEnv())
    const envPaths = [
      ...new Set(
        options.directories
          .filter((directory): directory is string => !!directory)
          .map((directory) => resolve(directory))
      ),
    ].flatMap((directory) =>
      collectEnvFilePaths(
        directory,
        envMode,
        options.includeLocalInTest ?? true
      )
    )

    if (envPaths.length === 0) {
      return
    }

    loadDotenv({
      path: envPaths,
      override: false,
      quiet: true,
    })
  }
}

export function readEnvString(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}
