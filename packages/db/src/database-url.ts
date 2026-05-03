import {
  createWorkspaceEnvLoader,
  findWorkspaceRoot,
  readEnvString,
} from '@mianshitong/shared/server'

const DATABASE_URL_ENV_KEY = 'DATABASE_URL'
const loadProjectEnvOnce = createWorkspaceEnvLoader({
  directories: [findWorkspaceRoot(process.cwd())],
  includeLocalInTest: false,
})

function requireEnvValue(key: string) {
  const value = readEnvString(key)

  if (value) {
    return value
  }

  throw new Error(`${key} is required`)
}

export function getRequiredDatabaseUrl() {
  loadProjectEnvOnce()
  return requireEnvValue(DATABASE_URL_ENV_KEY)
}
