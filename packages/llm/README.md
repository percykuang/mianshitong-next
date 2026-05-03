# LLM 包说明

`@mianshitong/llm` 负责聊天模型目录、模型提供方解析、模型客户端创建和模型输出规范化。

## 目录结构

```text
llm/
├── README.md
└── src/
├── index.ts
├── types.ts
├── catalog.ts
├── client/
│   ├── index.ts
│   ├── plan.ts
│   └── cache.ts
├── model-config/
│   ├── index.ts
│   ├── commands.ts
│   ├── queries.ts
│   ├── mapper.ts
│   ├── provider.ts
│   ├── crypto.ts
│   └── types.ts
├── output/
│   └── index.ts
├── provider/
│   └── index.ts
├── server/
│   └── env.ts
└── shared/
    └── openai-compatible.ts
```

## 职责划分

- `src/catalog.ts`
  - 用户可选模型、默认模型、模型 ID 规范化等目录查询能力
- `src/model-config/commands.ts`
  - 模型配置新增、更新、删除等写操作与规则校验
- `src/model-config/queries.ts`
  - 模型配置读取、运行时目录构建与默认模型解析
- `src/model-config/mapper.ts`
  - 数据库行、运行时配置、管理端摘要之间的映射
- `src/model-config/provider.ts`
  - provider 默认能力、Base URL 规范化与 DB provider 适配
- `src/model-config/crypto.ts`
  - 模型 API Key 的加解密与脱敏
- `src/provider/index.ts`
  - 对外暴露可安全复用的 provider 默认值辅助函数
- `src/server/env.ts`
  - llm 的服务端 env 初始化与密钥读取入口
- `src/shared/openai-compatible.ts`
  - OpenAI Compatible Base URL 的纯字符串规范化
- `src/client/plan.ts`
  - 聊天模型运行时解析与连接配置组装
- `src/client/cache.ts`
  - ChatOpenAI 缓存、cache key 与实例化
- `src/client/index.ts`
  - 对外公开的聊天模型客户端入口
- `src/output/index.ts`
  - 模型输出文本、流式 chunk、JSON 片段的规范化
- `src/index.ts`
  - 对外稳定公开 API

## 核心概念

- `provider`
  - 模型提供方，表示请求最终发给谁，例如 `deepseek`、`ollama`
- `model`
  - 具体模型名，例如 `deepseek-v4-flash`、`qwen3:4b`
- `modelId`
  - 面向业务层暴露的稳定聊天模型 ID，例如 `qwen3-4b`、`deepseek-v4-flash`

## 选择链路

1. 业务层先传入 `modelId`
2. 从数据库 `ChatModelConfig` 中读取启用模型并解析当前 `modelId`
3. `client/plan.ts` 根据当前 `modelId` 对应的 provider 和连接配置解析最终连接配置
4. `client/index.ts` 基于完整连接配置创建并缓存 `ChatOpenAI` 客户端
5. 普通聊天使用默认模型客户端；结构化输出可通过 provider 能力判断启用 JSON Output

## 环境变量分层

- `MODEL_CONFIG_SECRET`
  - 后台保存模型 API Key 时使用的加密密钥

## 开发约定

1. 当前项目只维护一套模型选择逻辑；普通聊天通过 `getChatModel()` 获取模型客户端，结构化输出通过 `getJsonChatModel()` 获取带 provider 能力判断的模型客户端。
2. 业务层优先依赖“聊天模型 ID”，不要直接依赖具体 provider 名称或真实模型名。
3. 根入口只暴露稳定 API，不再暴露底层目录结构。
4. 前端只能拿公开模型列表，不应接触 `baseUrl`、`apiKey` 等敏感信息。
5. `temperature`、`maxTokens` 等生成参数默认交给模型提供方处理，项目内不维护额外环境变量开关。
6. 当前仅对 `deepseek` provider 启用 JSON Output；DeepSeek V4 的结构化输出会使用 JSON 专用参数关闭 thinking，`ollama` 默认继续使用提示词 JSON 和安全解析，避免依赖本地 Ollama 版本差异。
7. 不再维护旧模型 ID alias；外部传入未知模型 ID 时统一回退到当前启用默认模型。
8. `supportsJsonOutput` 在模型配置中表示“最终开关值”；provider 注册表只提供默认建议值，不直接覆盖已保存的模型配置。
