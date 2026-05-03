# 数据库访问层设计

本文档约定 `packages/db` 的目标职责、模块组织方式和迁移顺序，用于把仓库中的数据库访问逻辑逐步收敛到统一的数据访问层。

## 目标

- `packages/db` 负责 Prisma Client、事务封装、领域化 repository 和数据库强相关类型。
- `apps/web`、`apps/admin`、`packages/llm` 负责业务用例编排、权限判断、参数校验和 presenter。
- 新增数据库读写优先沉淀到 `packages/db`，减少 Prisma 查询在业务层继续扩散。

## 非目标

- 不把页面 DTO、中文文案、路由参数解析放进 `packages/db`。
- 不把完整业务流程编排放进 `packages/db`。
- 不要求一次性迁完所有历史模块，优先按领域逐步迁移。

## 分层职责

### `packages/db`

适合放入：

- Prisma Client 与连接管理
- 事务 helper
- 聚合级查询与写入
- 数据库存储结构到仓储返回结构的映射
- 与数据库强绑定的分页、排序、筛选片段

不适合放入：

- 权限判断
- HTTP 请求体解析
- 页面表格字段拼装
- 中文错误提示
- 跨多个领域的业务流程控制

### `apps/web`、`apps/admin`、`packages/llm`

保留职责：

- 用例编排
- 权限与登录态判断
- 参数校验和 payload 解析
- 业务错误语义
- UI / API 视角的 presenter

## 目标目录

建议把 `packages/db/src` 逐步组织为：

```text
packages/db/src/
  client.ts
  client-types.ts
  index.ts

  auth-user/
    repository.ts
    types.ts

  admin-user/
    repository.ts
    types.ts

  user-actor/
    repository.ts
    types.ts

  chat-session/
    repository.ts
    query.ts
    types.ts

  chat-message/
    repository.ts
    query.ts
    types.ts

  chat-model-config/
    repository.ts
    types.ts

  career-thread/
    repository.ts
    types.ts
```

说明：

- `repository.ts`
  - 直接承载 Prisma 查询
  - 暴露 `find / list / create / update / delete / upsert / count` 这类稳定仓储接口
- `query.ts`
  - 只放复杂 `select / include / where / orderBy` 片段
  - 默认视为模块内部实现细节
- `types.ts`
  - 只放仓储层公开输入输出类型
  - 不把页面 DTO 直接放进 `db`
- `index.ts`
  - 统一组装 `db` 根对象
  - 暴露 `db.transaction(...)` 和各领域对象 API

## 命名规则

### 模块目录

- 目录名优先使用领域名，采用 kebab-case，例如：
  - `chat-session`
  - `chat-model-config`
  - `career-thread`

### 业务侧调用

- 业务层默认只导入一个 `db` 对象：
  - `db.adminUser.createSession()`
  - `db.authUser.findByEmail()`
  - `db.userActor.updateLastSeen()`
  - `db.chatModelConfig.listEnabled()`
- 跨多步写操作优先走统一事务入口：
  - `db.transaction(async (tx) => { ... })`
  - 事务内默认复用同构 API，例如 `tx.chatModelConfig.create()`、`tx.authUser.deleteWithActorById()`

### 模块内函数

- 模块对象内部的公开方法优先使用短动作名：
  - `findById`
  - `findByEmail`
  - `createSession`
  - `deleteSessionByToken`
  - `updateLastSeen`
- 避免在方法名里重复对象语义，例如已有 `db.adminUser`，就不再暴露 `createAdminUserSession`

### 类型命名

- 仓储输入输出类型使用显式前缀：
  - `DbChatModelConfigCreateInput`
  - `DbStoredChatSessionRow`
- 不向业务层暴露 Prisma namespace 或 Prisma 原生输入类型。

## 暴露原则

- `packages/db/src/index.ts` 默认导出 `db` 根对象和公共类型。
- 业务层默认使用 `import { db } from '@mianshitong/db'`，不直接依赖深路径。
- 不通过 `db.prisma` 向业务层暴露 raw Prisma Client；底层 client 只在 `packages/db` 内部仓储实现里使用。
- 若后续模块继续增多，再考虑为 `@mianshitong/db/<domain>` 增加 subpath exports。

## 当前迁移判断

### 已作为试点的模块

- `chat-model-config`
  - 适合作为第一块试点，因为领域边界清晰，主要职责是模型配置表的读写与排序。

### 第一批最值得迁移的 5 个模块

1. `career-thread`
   - 迁移前来源：`apps/web/server/career/state/thread-state-service.ts`
   - 目标位置：`packages/db/src/career-thread/repository.ts`
   - 原因：单表读写明确，和业务编排边界清晰，迁移风险低。
   - 当前状态：已迁移

2. `auth-user`
   - 迁移前来源：`apps/web/server/auth/user-repository.ts`
   - 目标位置：`packages/db/src/auth-user/repository.ts`
   - 原因：已经是天然 repository 形态，迁移后可让 web 认证编排层只保留登录/注册流程。
   - 当前状态：已迁移

3. `admin-user`
   - 迁移前来源：`apps/admin/server/auth/user-repository.ts`
   - 目标位置：`packages/db/src/admin-user/repository.ts`
   - 原因：和前台用户认证是两套表结构，边界独立，适合作为单独模块收敛。
   - 当前状态：已迁移

4. `user-actor`
   - 迁移前来源：`apps/web/server/chat/actor.ts`、`apps/web/server/chat/application/resolve-chat-usage.ts`
   - 目标位置：`packages/db/src/user-actor/repository.ts`
   - 原因：`UserActor`、额度查询、最近活跃时间更新都属于强数据库语义，后续还能被聊天、统计、后台复用。
   - 当前状态：已迁移

5. `chat-session`
   - 迁移前来源：`apps/web/server/chat/session/repository.ts`、`apps/web/server/chat/session/query.ts`
   - 目标位置：`packages/db/src/chat-session/repository.ts`
   - 原因：已经具备聚合根形态，迁移后可以让聊天用例层更专注于“发消息 / 编辑 / 续聊 / 生成标题”等流程编排。
   - 当前状态：已迁移

## 暂不优先迁移

- `apps/admin/server/session/application.ts`
  - 当前混合了列表筛选、排序、展示字段拼装，直接搬到 `db` 会把 admin 页面语义污染进数据访问层。
- `apps/admin/server/user/application.ts`
  - 当前仍带有后台列表展示导向的 label、分页结果结构，适合先拆 presenter 再迁仓储。
- `apps/web/server/chat/persistence/*`
  - 当前和回复生命周期、中断恢复、消息回填耦合较深，建议放到第二批处理。

## 迁移步骤

建议每次迁移都按这个顺序执行：

1. 在 `packages/db/src/<domain>/` 新建模块目录。
2. 复制现有 Prisma 查询，保持外部行为不变。
3. 在原业务层把直接 Prisma 调用改为 `db.<domain>.<method>`。
4. 保持 API 返回结构不变，只替换底层数据来源。
5. 运行相关检查后，再删除旧 repository 文件。

## 验证要求

每次迁移至少验证：

- `pnpm --filter <affected-package> exec tsc --noEmit`
- 受影响应用的关键用例能正常跑通
- 没有把页面 DTO、中文文案、权限判断误迁进 `packages/db`
