# 面试通 Next

面试通 Next 是面试通的新一代实现，用于替代旧版 `mianshitong`。项目采用 pnpm workspace 管理 Web 主站、Admin 后台和共享 packages，支持本地 Ollama 调试、生产 DeepSeek 调用，以及基于 Docker + GitHub Actions 的自动部署。

## 项目结构

```text
apps/
  web/      用户侧主站，包含登录注册、聊天页、聊天 API 和职业辅导工作流
  admin/    管理后台，包含管理员登录、用户管理、会话查看和额度配置
packages/
  db/       Prisma schema、Prisma Client 和数据库连接
  llm/      LLM Provider、模型目录和模型客户端
  shared/   共享常量、runtime 工具和通用类型
  ui/       Web/Admin 复用 UI 组件
  tokens/   设计 token 与主题变量
  hooks/    可复用 React hooks
  icons/    图标出口

deploy/      生产 Docker Compose、Caddy 配置和远程部署脚本
.github/     CI 与自动部署 workflow
```

## 环境要求

- Node.js：建议使用仓库内 `.nvmrc` / `.node-version` 指定版本
- pnpm：`10.18.2`
- Docker / Docker Compose：本地数据库与生产部署需要
- PostgreSQL：本地通过 `docker-compose.yml` 启动，生产通过 `deploy/compose.prod.yml` 启动

```bash
nvm use
pnpm install
```

## 本地开发

复制并按需填写环境变量：

```bash
cp .env.example .env.development
```

启动本地数据库：

```bash
pnpm db:up
pnpm db:migrate
```

启动 Web 主站：

```bash
pnpm dev:web
```

启动 Admin 后台：

```bash
pnpm dev:admin
```

默认端口：

- Web：`http://127.0.0.1:3000`
- Admin：`http://127.0.0.1:3001`

## LLM 配置

本地默认使用 `APP_ENV=development` 下的 Ollama 模型目录；生产默认使用 `APP_ENV=production` 下的 DeepSeek 模型目录。

常用变量：

```env
APP_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_API_KEY=ollama
# OLLAMA_MODEL=qwen3:1.7b

DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_BASE_URL=https://api.deepseek.com
# DEEPSEEK_MODEL=deepseek-chat
```

`OLLAMA_MODEL` / `DEEPSEEK_MODEL` 是可选覆盖项；不配置时会使用 `packages/llm/src/environment-catalog.ts` 中的默认模型。

## 常用命令

```bash
pnpm lint
pnpm lint:styles
pnpm format:check
pnpm spellcheck
pnpm typecheck
pnpm check
```

说明：

- `pnpm check` 与 CI 的检查入口保持一致。
- `pre-commit` 会运行 `lint-staged`，只处理暂存文件。
- `pre-push` 会运行 `pnpm check`，提前发现 CI 中的全量检查问题。

构建：

```bash
pnpm build:web
pnpm build:admin
```

## 数据库

本地数据库命令：

```bash
pnpm db:up
pnpm db:down
pnpm db:logs
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

生产部署时，`migrate` 容器会执行 Prisma migration：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  run --rm migrate
```

## 生产部署

生产部署使用 Docker、Caddy 和 GitHub Actions。详细发布、服务器配置、常见失败排查与回滚流程见：

- `docs/deployment-runbook.md`

## 后台管理员运维

后台管理员存储在 `AdminUser` 表，密码使用 scrypt hash。创建管理员、重置密码和登录失败排查见：

- `docs/admin-operations.md`

## LLM 配置

模型目录、环境选择、Ollama/DeepSeek 配置、JSON Output 策略见：

- `docs/llm-configuration.md`

## 安全提醒

- 不要提交 `.env.production`、`.env.prod`、API Key、数据库密码或私钥。
- 泄露过的 `DEEPSEEK_API_KEY`、数据库密码、SSH 私钥应及时轮换。
- 生产部署前建议备份旧项目数据库和 Docker volume。
