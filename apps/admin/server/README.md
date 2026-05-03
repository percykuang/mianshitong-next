# Admin Server 架构说明

`apps/admin/server` 负责后台管理端的服务端能力，包括管理员认证、会话管理和用户管理。

当前按下面的结构组织：

- `index.ts` 作为后台服务端统一公开入口
- `auth/` 负责管理员认证与登录态处理
- `session/` 负责后台会话查询与删除
- `user/` 负责后台用户查询与配额管理
- `shared/` 放跨模块复用的查询工具

## 目录结构

```text
server/
├── index.ts
├── README.md
├── shared/
│   └── query.ts
├── auth/
│   ├── index.ts
│   ├── application.ts
│   ├── password.ts
│   ├── session.ts
│   ├── session-cleanup.ts
│   └── validation.ts
├── session/
│   ├── index.ts
│   └── application.ts
└── user/
    ├── index.ts
    └── application.ts
```

## 各层职责

### `index.ts`

后台服务端统一出口。页面、容器和 API 路由优先从这里导入，不直接引用某个 `application.ts` 深路径。

### `auth/`

负责管理员认证能力：

- `application.ts`
  - 登录、登出、获取当前管理员、鉴权检查
- `session.ts`
  - session cookie 的读写与当前用户解析
- `session-cleanup.ts`
  - 过期 session 的兜底清理
- `password.ts`
  - 密码校验
- `validation.ts`
  - 登录参数校验

### `session/`

负责后台会话管理用例：

- 列表筛选
- 详情查询
- 删除会话

### `user/`

负责后台用户管理用例：

- 用户列表
- 配额修改
- 删除注册用户

### `shared/`

放后台多模块共享的查询辅助逻辑，例如分页、排序、搜索、日期区间处理。

## 开发约定

1. 页面和 API 路由优先从 `@/server` 导入后台公开能力；容器层如果只需要某个模块的类型或能力，可以从 `@/server/session`、`@/server/user` 这类子模块入口导入。
2. `application.ts` 负责后台业务用例，不直接暴露给 UI 层以外的内部查询细节。
3. `auth/session.ts` 属于认证基础设施，只有 cookie 和当前登录态解析相关逻辑应放在这里。
4. 新增后台能力时，优先判断是放入 `auth/`、`session/`、`user/` 现有子模块，还是再新增独立子模块，不要继续堆进已有 `application.ts`。
5. 大模块优先逐步拆成按用例命名的文件；当前较小模块可继续保留 `application.ts`，但不要从 UI 层直接导入它。
6. 管理员认证相关的数据库访问已经收敛到 `packages/db/src/admin-user/`，不要在 `apps/admin/server/auth` 内重新引入 Prisma 直连查询。
