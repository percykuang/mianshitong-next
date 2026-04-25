import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  // 这些共享包直接暴露的是 monorepo 里的 TS/TSX 源码，需要让 Next.js 在应用侧参与转译。
  transpilePackages: [
    '@mianshitong/icons',
    '@mianshitong/tokens',
    '@mianshitong/ui',
  ],
}

export default nextConfig
