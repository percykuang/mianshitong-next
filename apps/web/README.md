# Web 应用说明

`apps/web` 是面向用户的主站应用，负责首页、登录注册、聊天页面、聊天 API 和职业辅助 workflow。

## 目录结构

```text
web/
├── app/
├── components/
├── server/
├── utils/
├── assets/
├── next.config.ts
└── package.json
```

## 职责划分

- `app/`
  - Next.js App Router 页面、布局和 API 路由
  - `app/chat/` 包含聊天页客户端状态、领域类型、hooks 和请求工具
- `components/`
  - web 端页面级或业务级组件，例如首页、认证入口、聊天 UI
- `server/`
  - web 端服务端业务能力，包括认证、聊天、career workflow
  - 子模块内部说明优先查看对应 `server/*/README.md`
- `utils/`
  - web 端轻量工具，例如登录跳转、登出、认证表单辅助逻辑
- `assets/`
  - 仅服务于 web 应用的静态或展示资源

## 开发约定

1. 页面和 API 路由负责框架编排，业务用例优先放入 `server/` 子模块。
2. 通用 UI 优先沉淀到 `@mianshitong/ui`；只服务 web 单端的业务组件留在 `components/`。
3. 聊天状态相关逻辑优先留在 `app/chat/`，不要提前抽到共享包。
4. 调用服务端能力时优先从对应模块公开入口导入，例如 `@/server/auth`、`@/server/chat`、`@/server/career`。
5. 新增跨 web/admin 复用能力前，先判断是否应放入 `packages/*`，避免 app 内复制。
6. 修改页面视觉、资源加载、导航或交互时，默认做一轮本地页面验证。

## 常用命令

- `pnpm dev:web`
  - 启动 web 开发服务
- `pnpm --filter @mianshitong/web typecheck`
  - 仅检查 web 类型
- `pnpm --filter @mianshitong/web lint`
  - 仅检查 web lint
