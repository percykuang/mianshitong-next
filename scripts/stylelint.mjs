import { spawnSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

// 统一收口 Stylelint 的执行参数，避免把长命令直接堆在 package.json 里。
const cacheDir = '.cache/stylelint'
// 通过命令行参数控制是否开启自动修复，对应 `pnpm lint:styles:fix`。
const shouldFix = process.argv.includes('--fix')

// 确保缓存目录存在，这样 Stylelint 可以把缓存稳定写到隐藏目录下。
await mkdir(cacheDir, { recursive: true })

// 统一约定只检查 apps 下的 CSS 文件，并把缓存放到 .cache/stylelint 中。
const args = ['apps/**/*.css', '--cache', '--cache-location', `${cacheDir}/`]

if (shouldFix) {
  args.push('--fix')
}

// 直接调用本地 stylelint，可继承终端输出，便于在 pnpm 脚本里查看原始报错。
const result = spawnSync('stylelint', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 0)
