# Web Auth 架构说明

`apps/web/server/auth` 负责站点用户认证能力，包括注册、登录、当前用户读取和 session cookie 管理。

## 目录结构

```text
auth/
├── index.ts
├── README.md
├── application.ts
├── password.ts
├── session.ts
├── user-repository.ts
└── validation.ts
```

## 各层职责

- `index.ts`
  - 模块统一公开入口
- `application.ts`
  - 登录、注册、登出、获取当前用户资料等业务用例
- `session.ts`
  - cookie 读写和基于 session token 的当前用户解析
- `user-repository.ts`
  - 认证相关的用户与 session 数据访问
- `password.ts`
  - 密码哈希与校验
- `validation.ts`
  - 登录与注册参数校验

## 开发约定

1. 路由层和页面层优先从 `@/server/auth` 导入，不再依赖 `services/*` 深路径。
2. 认证业务编排放 `application.ts`，不要继续堆进 `session.ts`。
3. `session.ts` 只处理登录态基础设施，不承担注册、登录业务判断。
