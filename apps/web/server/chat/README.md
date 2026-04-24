# Chat 架构说明

`chat` 目录负责通用聊天会话的服务端能力，包括会话参与者识别、会话读写、回复准备和使用量统计。

当前整体按下面的分层组织：

- `application/` 提供给 App Router 和页面装配层调用的用例入口
- `actor.ts` 负责识别当前聊天参与者
- `session/` 负责会话聚合读取与持久化仓库
- `persistence/` 负责消息级写入与编辑等底层存储操作

## 目录结构

```text
chat/
├── index.ts
├── README.md
├── actor.ts
├── application/
│   ├── index.ts
│   ├── bootstrap-chat-page.ts
│   ├── manage-chat-session.ts
│   ├── reply-context.ts
│   ├── send-chat-message.ts
│   ├── edit-chat-message.ts
│   └── resolve-chat-usage.ts
├── persistence/
│   ├── index.ts
│   ├── assistant.ts
│   ├── edit.ts
│   ├── query.ts
│   ├── session.ts
│   └── shared.ts
└── session/
    ├── index.ts
    ├── presenter.ts
    ├── query.ts
    └── repository.ts
```

## 各层职责

### `index.ts`

模块对外统一入口。默认只暴露 `application` 层能力，避免路由层直接依赖底层仓库或查询细节。

### `application/`

这一层负责承接页面或 API 的业务用例，不直接暴露 Prisma 查询形状。

- `bootstrap-chat-page.ts`
  - 组装聊天页初始化数据
- `reply-context.ts`
  - 构建回复所需的模型、上下文和 career workflow 兜底逻辑
- `send-chat-message.ts`
  - 准备新消息和续聊消息回复所需上下文
- `edit-chat-message.ts`
  - 准备编辑最后一条用户消息后的重答上下文
- `manage-chat-session.ts`
  - 会话列表、创建、更新、删除、打断回复持久化
- `resolve-chat-usage.ts`
  - 查询每日额度与限流判断

### `actor.ts`

只负责识别当前会话参与者：

- 已登录用户映射为 registered actor
- 未登录用户通过 guest cookie 识别或创建 guest actor

### `session/`

这一层处理“会话”这个聚合根：

- `repository.ts`
  - 会话列表、详情、创建、更新、删除、反馈等仓库操作
- `presenter.ts`
  - 持久化记录到页面领域模型的转换
- `query.ts`
  - 会话查询形状与推导类型，仅供本层和底层内部使用
- `index.ts`
  - 只聚合仓库层公开函数，不再导出查询细节

### `persistence/`

这一层负责消息级别的底层写入动作：

- `session.ts`
  - 创建或查找会话、写入用户消息并回读上下文
- `assistant.ts`
  - 持久化助手回复、处理中断回复补写
- `edit.ts`
  - 编辑最后一条用户消息并裁剪后续消息
- `query.ts`
  - 编辑/中断场景需要的查询形状
- `shared.ts`
  - Prisma client、公共比较逻辑、兼容回退逻辑

## 开发约定

1. 路由层和页面装配层优先从 `@/server/chat` 导入，不直接依赖 `session/query.ts` 这类内部细节。
2. 新增聊天业务流程时，优先放到 `application/`，不要把业务编排写进 `persistence/` 或 `session/repository.ts`。
3. `session/` 负责会话聚合，`persistence/` 负责消息级操作；不要把两层职责混在一个文件里。
4. 查询形状和推导类型默认视为内部实现细节，除非有明确复用需求，否则不要继续向外扩散导出。
5. 大模块优先使用按用例命名的文件，例如 `send-chat-message.ts`、`edit-chat-message.ts`、`manage-chat-session.ts`；小模块可以保留 `application.ts` 作为单一用例入口。
