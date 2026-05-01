# LLM 配置说明

本文档记录 `@mianshitong/llm` 的模型配置读取、模型客户端策略和后台模型中心约束。

## 设计目标

当前项目保持一套统一模型逻辑：

- 普通聊天和结构化输出使用同一个业务模型。
- 不引入 `ModelUseCase`、`structured`、`reasoning` 等业务分层。
- 本地开发优先低成本调试，生产环境优先稳定质量。

## 核心文件

```text
packages/llm/src/catalog.ts
packages/llm/src/model-config-store.ts
packages/llm/src/client.ts
packages/llm/src/env.ts
packages/llm/src/output.ts
packages/llm/src/types.ts
```

职责：

- `catalog.ts`
  - 提供模型选项、默认模型、model id 规范化和目录项查询
- `model-config-store.ts`
  - 负责数据库模型配置读取、API Key 加解密和运行时目录选择
- `client.ts`
  - 根据数据库模型目录创建 LangChain `ChatOpenAI` 客户端
- `env.ts`
  - 加载 workspace 环境变量，并处理 OpenAI-compatible base URL 规范化
- `output.ts`
  - 规范化模型文本输出、从模型文本中提取 JSON 对象

## 模型目录

运行时模型目录只来源于后台 `ChatModelConfig` 表中的启用模型。

目录项包含：

```ts
{
  id: string
  label: string
  baseUrl?: string
  apiKey?: string
  jsonModelKwargs?: Record<string, unknown>
  model: string
  modelKwargs?: Record<string, unknown>
  provider: 'ollama' | 'deepseek' | 'openai-compatible'
  supportsJsonOutput?: boolean
  description?: string
}
```

说明：

- `id` 是业务层稳定使用的模型 ID。
- `model` 是 provider 实际模型名。
- `provider` 决定 base URL 规范化和默认能力语义。
- 数据库存储的 `baseUrl` / `apiKey` 只在服务端使用，前端只能拿到 `id`、`label`、`description` 等公开字段。
- `modelKwargs` 是 provider 专用请求体扩展参数，例如 DeepSeek V4 的 thinking 配置。
- `jsonModelKwargs` 是结构化输出专用扩展参数；未配置时复用 `modelKwargs`。

## 环境变量

模型配置中心：

```env
MODEL_CONFIG_SECRET=<stable-random-secret>
```

说明：

- `MODEL_CONFIG_SECRET` 用于加密后台保存的模型 API Key。
- 模型的 `baseUrl`、`apiKey`、`model`、`provider` 都在后台配置中心逐条维护。
- 不再使用 `OLLAMA_MODEL` / `DEEPSEEK_MODEL` 这种 provider 级模型覆盖变量，避免多个目录项被隐式映射到同一个实际模型。

## JSON 输出策略

当前结构化输出链路使用：

```text
getJsonChatModel()
```

策略：

- DeepSeek：启用 JSON Output，即 `response_format: { type: 'json_object' }`，并默认使用 `jsonModelKwargs` 关闭 thinking，降低结构化输出波动。
- Ollama：不强行开启 JSON Output，继续依赖 prompt 约束 + JSON 提取 + Zod 校验

原因：

- DeepSeek API 对 JSON Output 支持更稳定。
- DeepSeek V4 thinking 更适合面向用户的深度回复，不适合作为内部 JSON 抽取默认行为。
- 本地 Ollama 的 OpenAI-compatible JSON 行为受版本和模型影响较大，不强行依赖。

## 小模型容错

本地小模型可能漏字段、输出空数组或输出 `null`。业务 schema 应对非核心字段保持适度宽容，例如：

- `null` 可归一为 `undefined`
- 空 `options` 可归一为 `null`
- 非核心说明字段可提供默认值

目标是：结构化抽取失败不应轻易打断主聊天体验。

## 新增模型流程

推荐流程：

1. 在 admin 后台的“模型配置”页面新增模型。
2. 填写 `id`、显示名称、provider、`baseUrl`、`apiKey`、`model` 等字段。
3. 按需填写 `modelKwargs` 与 `jsonModelKwargs`。
4. 至少保留一个启用中的默认模型。

如果新增的是全新的 provider 协议类型，而不是现有的 `deepseek` / `ollama` / `openai-compatible` 变体，仍需要扩展代码中的 provider 适配层。

改动后检查：

```bash
pnpm --filter @mianshitong/web typecheck
pnpm --filter @mianshitong/admin typecheck
```

## 不做的事

当前项目暂不引入：

- 按 `chat` / `structured` / `reasoning` 区分模型用例
- 多模型编排
- provider 自动 fallback
- 面向所有本地模型的强制 JSON Output 能力检测

这些能力只有在产品确实需要多模型策略时再引入。
