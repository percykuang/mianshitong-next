# Career 架构说明

`career` 目录负责前端求职 Copilot 的多轮对话能力。当前整体架构遵循：

- 单主 Agent 负责热路径流式回复
- State Extractor 在回复后异步提取状态
- Capability 负责声明任务模式与专属 prompt
- Thread State 负责维持多轮连续性

## 目录结构

```text
career/
├── index.ts
├── README.md
├── application/
│   ├── index.ts
│   └── workflow-engine.ts
├── agents/
│   ├── main-agent/
│   │   ├── build-instructions.ts
│   │   ├── index.ts
│   │   └── prompt.ts
│   ├── capability-selector/
│   │   ├── index.ts
│   │   ├── prompt.ts
│   │   ├── schema.ts
│   │   └── select-capability.ts
│   └── state-extractor/
│       ├── apply-state-extraction.ts
│       ├── extract-state.ts
│       ├── index.ts
│       ├── invoke-structured-model.ts
│       ├── prompt.ts
│       ├── schema.ts
│       └── state-payload.ts
├── capabilities/
│   ├── index.ts
│   ├── config.ts
│   ├── registry.ts
│   ├── types.ts
│   ├── frontend-learning/
│   │   ├── index.ts
│   │   └── prompt.ts
│   ├── frontend-other/
│   │   ├── index.ts
│   │   └── prompt.ts
│   ├── frontend-qa/
│   │   ├── index.ts
│   │   └── prompt.ts
│   ├── general/
│   │   ├── index.ts
│   │   └── prompt.ts
│   ├── mock-interview/
│   │   ├── index.ts
│   │   ├── prompt.ts
│   │   ├── runtime-state.ts
│   │   └── summary.ts
│   ├── project-highlight/
│   │   ├── index.ts
│   │   └── prompt.ts
│   ├── resume-optimize/
│   │   ├── index.ts
│   │   ├── prompt.ts
│   │   └── assets/
│   │       └── resume-template.ts
│   └── self-intro/
│       ├── index.ts
│       └── prompt.ts
├── shared/
│   ├── index.ts
│   ├── types/
│   │   ├── flow.ts
│   │   ├── index.ts
│   │   ├── intent.ts
│   │   ├── message.ts
│   │   └── thread-state.ts
│   └── prompts/
│       ├── base-role.ts
│       ├── chat-policy.ts
│       ├── index.ts
│       └── output-rules.ts
└── state/
    ├── index.ts
    ├── thread-state-service.ts
    └── thread-state.ts
```

## 各层职责

### `application/`

这一层只负责把 `career` 能力接入聊天主链路。

- `index.ts`
  - 对外导出 application 层公开入口
- `workflow-engine.ts`
  - 读取 thread state
  - 组装主 Agent 指令
  - 返回回复后状态提交回调

### `agents/`

这一层只放“会调用模型”的 Agent 逻辑。

- `main-agent/`
  - 面向用户直接回复
  - 负责热路径流式输出
- `capability-selector/`
  - 仅在没有 active flow 的首轮入口运行
  - 用结构化输出帮助主 Agent 更快拿到首个任务模式
- `state-extractor/`
  - 面向系统内部状态更新
  - 负责回复后结构化提取
- 每个子目录内的 `index.ts`
  - 负责聚合导出，减少跨层深路径 import

### `capabilities/`

这一层按能力卡拆目录。每个能力目录尽量自包含：

- `prompt.ts`
  - 该能力的专属指令
- `runtime-state.ts`
  - 仅当该能力有复杂运行状态时才存在，例如 `mock-interview`
- `summary.ts`
  - 用于把复杂运行状态转成更适合主 Agent 阅读的状态摘要
- `assets/`
  - 仅放该能力独占的静态素材，例如简历模板
- `index.ts`
  - 作为能力目录的统一导出入口
- `config.ts`
  - 只放能力卡静态配置数据
- `types.ts`
  - 只放 capability 层自己的配置类型
- `registry.ts`
  - 只放读取配置的访问函数，不再同时承担大段配置声明

`registry.ts` 是能力卡总表，用来声明：

- `intent`
- `label`
- `description`
- `entryGuidance`
- `handoffGuidance`
- `prompt`
- `initialPhase`

其中 `entryGuidance` 用于判断一个能力适合什么场景；`handoffGuidance` 用于用户在 active flow 中明确切换任务时，让主 Agent 低成本自然承接新任务，不额外增加一次路由模型调用。

### `shared/`

放跨层共享但不属于具体能力的内容。

- `types/`
  - 按语义拆分共享类型，例如 intent、message、flow、thread-state
- `prompts/`
  - 全局基础角色、统一输出规则、聊天总策略
- `index.ts`
  - 聚合导出共享类型和共享 prompt

### `state/`

只负责 thread state 的创建、更新和持久化。

- `thread-state.ts`
  - 纯内存状态变换
- `thread-state-service.ts`
  - 数据库存取与版本控制
- `index.ts`
  - 聚合导出 state 层公开能力

## 开发约定

1. 新增一个前端求职能力时，优先在 `capabilities/<intent>/` 下创建目录。
2. 如果该能力只需要 prompt，不要提前抽复杂 runtime-state。
3. 如果某个能力开始出现复杂 phase、scorecard、slots 结构，再补 `runtime-state.ts`。
4. 所有面向用户的热路径回复逻辑，应尽量通过 `main-agent` 完成，不要重新引入多级串行 router。
5. 所有强结构化输出，优先放到 `state-extractor` 或后台任务，不要阻塞首字时间。
6. 跨层引用时，优先从各层 `index.ts` 导入；只有在需要使用某个层内的私有细节实现时，才直接引用深路径文件。
7. active flow 内的明确任务切换，优先通过能力卡的 `handoffGuidance` 交给主 Agent 自然处理；不要为每个切换场景增加正则或额外串行路由。
