# TypeScript 环境边界

当前仓库把 TypeScript 配置分成两类基础环境：

- `tsconfig.base.json`
  - 面向通用前端与共享 TS 配置基线
  - 默认包含 `dom`、`dom.iterable`
- `tsconfig.client.json`
  - 面向 Next.js 客户端应用
  - 在 `tsconfig.base.json` 基础上补齐 Next.js 插件配置
- `tsconfig.server.json`
  - 面向纯服务端或运行时工具包
  - 只保留 `esnext`
  - 默认注入 `node` 类型

## 使用约定

1. `apps/web`、`apps/admin` 这类 Next.js 应用优先继承 `tsconfig.client.json`。
2. `packages/ui`、`packages/hooks`、`packages/icons`、`packages/tokens` 这类前端共享包继续继承 `tsconfig.base.json`。
3. `packages/db`、`packages/llm`、`packages/shared` 这类纯服务端或通用运行时包，优先继承 `tsconfig.server.json`。
4. 如果某个 package 同时包含浏览器代码和 Node 代码，不要强行混到同一份 tsconfig 下，优先先拆职责，再决定继承哪份基础配置。
