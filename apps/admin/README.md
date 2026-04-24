# Admin 应用说明

`apps/admin` 是后台管理应用，负责管理员登录、用户管理、会话管理和会话详情查看。

## 目录结构

```text
admin/
├── app/
├── container/
├── server/
├── ui/
├── utils/
├── hooks/
├── next.config.ts
└── package.json
```

## 职责划分

- `app/`
  - Next.js App Router 页面、布局和 API 路由
- `container/`
  - 后台页面级容器组件，负责列表、筛选、弹窗和页面交互编排
- `server/`
  - 后台服务端能力，包括管理员认证、用户管理、会话管理
  - 详细分层见 `server/README.md`
- `ui/`
  - admin 单端轻量 UI 封装，例如标题等页面局部组件
- `utils/`
  - admin 单端工具，例如登录跳转解析
- `hooks/`
  - admin 单端 Hook 聚合入口；跨应用 Hook 应优先放入 `@mianshitong/hooks`

## 开发约定

1. 页面和 API 路由优先从 `@/server` 导入后台公开能力。
2. `container/` 如果只需要某个模块的类型或能力，可以从 `@/server/session`、`@/server/user` 等子模块入口导入。
3. 后台业务查询、删除、更新等用例放入 `server/`，不要堆在页面或容器组件里。
4. 通用 UI 优先使用 `@mianshitong/ui`；只服务 admin 单端的小组件才放入 `ui/`。
5. 列表筛选、分页、排序参数应保持 URL 可恢复，相关 href 构建逻辑优先留在对应 container 子目录。
6. 修改后台表格、筛选、弹窗或 API 行为时，至少运行 admin typecheck，并按影响面做页面验证。

## 常用命令

- `pnpm dev:admin`
  - 启动 admin 开发服务
- `pnpm --filter @mianshitong/admin typecheck`
  - 仅检查 admin 类型
- `pnpm --filter @mianshitong/admin lint`
  - 仅检查 admin lint
