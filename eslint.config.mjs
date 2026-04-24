import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      next: {
        rootDir: ['apps/web/', 'apps/admin/'],
      },
    },
  },
  {
    files: ['apps/web/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/server/auth/**'],
              message:
                '请从 @/server/auth 模块入口导入，不要直接依赖内部实现。',
            },
            {
              group: ['@/server/career/**'],
              message:
                '请从 @/server/career 模块入口导入，不要直接依赖内部实现。',
            },
            {
              group: ['@/server/chat/**'],
              message:
                '请从 @/server/chat 模块入口导入，不要直接依赖内部实现。',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'apps/admin/app/**/*.{ts,tsx}',
      'apps/admin/container/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/server/*/application',
                '@/server/*/application.*',
                '@/server/shared/**',
              ],
              message:
                '请从 @/server 或对应子模块入口导入，不要直接依赖内部实现。',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/next-env.d.ts',
  ]),
])

export default eslintConfig
