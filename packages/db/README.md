# DB 包说明

`@mianshitong/db` 负责 Prisma Client、数据库 schema、迁移和少量与数据模型强相关的共享常量。

## 目录结构

```text
db/
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── index.ts
    ├── client.ts
    ├── database-url.ts
    └── user-actor-quota.ts
```

## 职责划分

- `prisma/schema.prisma`
  - 数据库模型定义和关系约束
- `prisma/migrations/`
  - Prisma 迁移历史
- `src/client.ts`
  - Prisma Client 创建与导出
- `src/database-url.ts`
  - 数据库连接地址解析
- `src/user-actor-quota.ts`
  - 与 `UserActor` 配额字段强相关的默认值和归一化逻辑
- `src/index.ts`
  - 对外稳定公开 API

## 开发约定

1. 业务查询、页面 DTO 和用例编排不要放进本包，应放在对应 app 的 `server/` 模块中。
2. 本包只沉淀跨应用共享且与数据库模型强绑定的能力，例如 Prisma Client、schema、迁移和模型级默认值。
3. 修改 `schema.prisma` 后必须同步生成迁移，并确认 `pnpm db:generate` 可以通过。
4. 不要从业务代码直接依赖 `prisma/*` 内部文件，应用层优先从 `@mianshitong/db` 导入公开能力。
