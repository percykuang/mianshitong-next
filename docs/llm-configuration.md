# LLM 配置说明

本文档记录 `@mianshitong/llm` 的模型目录、环境选择和模型客户端策略。

## 设计目标

当前项目保持一套统一模型逻辑：

- 普通聊天和结构化输出使用同一个业务模型。
- 不引入 `ModelUseCase`、`structured`、`reasoning` 等业务分层。
- 本地开发优先低成本调试，生产环境优先稳定质量。

## 核心文件

```text
packages/llm/src/catalog.ts
packages/llm/src/environment-catalog.ts
packages/llm/src/client.ts
packages/llm/src/env.ts
packages/llm/src/output.ts
packages/llm/src/types.ts
```

职责：

- `environment-catalog.ts`
  - 按 `APP_ENV` / `NODE_ENV` 返回当前环境可用模型目录
- `catalog.ts`
  - 提供模型选项、默认模型、model id 规范化和目录项查询
- `client.ts`
  - 根据模型目录和 provider 环境变量创建 LangChain `ChatOpenAI` 客户端
- `env.ts`
  - 加载 workspace 环境变量，并处理 OpenAI-compatible base URL 规范化
- `output.ts`
  - 规范化模型文本输出、从模型文本中提取 JSON 对象

## 环境选择

`APP_ENV` 优先级高于 `NODE_ENV`：

```env
APP_ENV=development
APP_ENV=production
```

如果未显式配置 `APP_ENV`：

- `NODE_ENV=production` 时按 `production`
- 其他情况按 `development`

## 模型目录

模型目录维护在：

```text
packages/llm/src/environment-catalog.ts
```

目录项包含：

```ts
{
  id: string
  label: string
  model: string
  provider: 'ollama' | 'deepseek'
  description?: string
}
```

说明：

- `id` 是业务层稳定使用的模型 ID。
- `model` 是 provider 实际模型名。
- `provider` 决定连接配置来源。

## 环境变量

本地 Ollama：

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_API_KEY=ollama
# OLLAMA_MODEL=<optional-model-override>
```

生产 DeepSeek：

```env
DEEPSEEK_API_KEY=<deepseek-api-key>
DEEPSEEK_BASE_URL=https://api.deepseek.com
# DEEPSEEK_MODEL=<optional-model-override>
```

模型覆盖变量是可选的：

- 不配置 `OLLAMA_MODEL` 时，使用当前目录项的 `model`。
- 不配置 `DEEPSEEK_MODEL` 时，使用当前目录项的 `model`。

## JSON 输出策略

当前结构化输出链路使用：

```text
getJsonChatModel()
```

策略：

- DeepSeek：启用 JSON Output，即 `response_format: { type: 'json_object' }`
- Ollama：不强行开启 JSON Output，继续依赖 prompt 约束 + JSON 提取 + Zod 校验

原因：

- DeepSeek API 对 JSON Output 支持更稳定。
- 本地 Ollama 的 OpenAI-compatible JSON 行为受版本和模型影响较大，不强行依赖。

## 小模型容错

本地小模型可能漏字段、输出空数组或输出 `null`。业务 schema 应对非核心字段保持适度宽容，例如：

- `null` 可归一为 `undefined`
- 空 `options` 可归一为 `null`
- 非核心说明字段可提供默认值

目标是：结构化抽取失败不应轻易打断主聊天体验。

## 新增模型流程

1. 在 `environment-catalog.ts` 对应环境添加目录项。
2. 确认 provider 连接变量已在 `.env.example` 或部署文档中说明。
3. 如果新增 provider，需要扩展：
   - `ModelProvider` 类型
   - `PROVIDER_CONFIG_BY_NAME`
   - JSON Output 支持能力
4. 运行：

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
