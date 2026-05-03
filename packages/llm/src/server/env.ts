import {
  createWorkspaceEnvLoader,
  findWorkspaceRoot,
  readEnvString,
} from '@mianshitong/shared/server'
import 'server-only'

const loadWorkspaceEnvOnce = createWorkspaceEnvLoader({
  directories: [findWorkspaceRoot(process.cwd())],
})

loadWorkspaceEnvOnce()

export { readEnvString }
