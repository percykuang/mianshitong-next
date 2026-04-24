# Chat Store

`apps/web/app/chat/store` 负责聊天页前端状态编排，基于 Zustand 维护会话列表、当前会话、输入框、流式回复和编辑态。

## 目录职责

- `core/`
  - `types.ts` 定义 store 的 state、actions 和外部可见类型。
  - `store.ts` 负责组装 store，并把 `reply`、`session` 两组 actions 挂进统一状态树。
  - `selectors.ts` 放纯读取逻辑，避免在组件里重复判断回复状态。
  - `helpers.ts` 放 session 级纯函数，例如按 id 查找会话、提交 optimistic reply。
- `reply/`
  - `actions.ts` 负责“发送消息 / 中断回复 / 切会话前打断当前回复”这类回复生命周期入口。
  - `stream.ts` 负责调用接口、处理 chunk、维护 optimistic session，并在结束后回填持久化结果。
  - `lifecycle.ts` 负责把回复收口为 completed / interrupted / failed 三种结果，并处理 hydration。
- `session/`
  - `actions.ts` 负责会话级交互，例如新建、删除、重命名、置顶、点赞点踩、编辑用户消息。
- `provider.tsx`
  - 提供 `ChatStoreProvider`、`useChatStore`、`useChatStoreApi`，是页面和组件访问 store 的唯一入口。

## 状态流转约定

- 发送消息时，前端先创建 optimistic session，让用户消息立即出现在界面上。
- 如果开启持久化，流结束后会用服务端真实 session 回填，覆盖 optimistic 数据。
- 如果流式回复被中断或失败，`reply/lifecycle.ts` 会根据是否已有部分内容、是否已持久化，决定保留中断结果、回滚 optimistic session，或重新 hydrate 服务端会话。
- 会话切换和新建会话前，会先尝试中断当前回复，避免旧请求继续写入错误的 session。

## 使用约束

- 页面和组件应通过 `useChatStore` / `useChatStoreApi` 调用公开 actions 和 selectors，不要直接依赖 `reply/*`、`session/*` 的内部实现。
- 新增交互时，优先判断它属于“回复生命周期”还是“会话管理”，分别放进 `reply` 或 `session`，避免把业务逻辑重新堆回组件层。
- 能放在 selector 或 helper 中的纯计算，不要写进组件 `useEffect`。
