import { PrismaPg } from '@prisma/adapter-pg'
import { createRequire } from 'node:module'
import { getRequiredDatabaseUrl } from './database-url'

type PrismaClientConstructor = typeof import('@prisma/client').PrismaClient
type PrismaClientInstance = import('@prisma/client').PrismaClient

// 在 Next.js + Turbopack 下走运行时 require，避免 Prisma client 被错误打包。
const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client') as {
  PrismaClient: PrismaClientConstructor
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: getRequiredDatabaseUrl(),
    }),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// 开发环境复用单例，避免热更新时创建过多数据库连接。
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
