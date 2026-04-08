import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 这些共享包直接暴露的是 monorepo 里的 TS/TSX 源码，需要让 Next.js 在应用侧参与转译。
  transpilePackages: [
    '@mianshitong/db',
    '@mianshitong/icons',
    '@mianshitong/tokens',
    '@mianshitong/ui',
  ],
  // Prisma 相关服务端依赖改走原生 Node.js require，避免 Turbopack 打包运行时代码时解析异常。
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
}

export default nextConfig
