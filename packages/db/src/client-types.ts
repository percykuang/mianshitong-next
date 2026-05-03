import type { prisma } from './client'

export type PrismaClientInstance = typeof prisma

export type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export type DbClient = PrismaClientInstance | PrismaTransactionClient
