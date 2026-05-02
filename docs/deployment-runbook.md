# 生产部署 Runbook

本文档记录面试通 Next 的生产发布、服务器配置、常见故障排查和回滚流程。所有示例都使用占位符，真实密钥、密码、域名和镜像仓库地址不要写入仓库。

## 部署组成

生产部署由以下文件共同完成：

- `Dockerfile`
  - 构建 `web`、`admin`、`migrate` 三类镜像
  - `builder` 阶段使用构建期占位 `DATABASE_URL`，运行时由 `.env.prod` 覆盖
- `deploy/compose.prod.yml`
  - 编排 `db`、`migrate`、`web`、`admin`、`caddy`
- `deploy/Caddyfile`
  - 将公网域名反向代理到 Docker 内部的 `web:3000` 与 `admin:3000`
- `.github/workflows/deploy.yml`
  - push 到 `main` 后构建镜像、推送镜像仓库，并通过 SSH 触发服务器部署
- `deploy/scripts/deploy.sh`
  - 在服务器上拉取镜像、启动数据库、执行 migration、启动应用与 Caddy
- `deploy/scripts/rollback.sh`
  - 通过指定镜像 tag 回滚

如果服务器同时运行多个项目，并共享同一个公网 `80/443` 入口，请额外阅读：

- `docs/shared-server-deployment.md`

## GitHub Secrets

在 GitHub 仓库 `Settings → Secrets and variables → Actions` 中配置：

```text
PROD_SSH_HOST
PROD_SSH_PORT
PROD_SSH_USER
PROD_SSH_PRIVATE_KEY
PROD_DEPLOY_PATH

REGISTRY_HOST
REGISTRY_NAMESPACE
REGISTRY_USERNAME
REGISTRY_PASSWORD
```

说明：

- `PROD_SSH_PRIVATE_KEY` 必须是完整私钥内容，不是 `.pub` 公钥。
- 对应公钥需要加入服务器目标用户的 `~/.ssh/authorized_keys`。
- `REGISTRY_HOST` 不要包含协议和 namespace，例如只填 `<registry-host>`。
- `REGISTRY_NAMESPACE` 只填命名空间，例如 `<registry-namespace>`。

## 服务器 `.env.prod`

服务器部署目录由 `PROD_DEPLOY_PATH` 指定，例如：

```bash
mkdir -p /opt/mianshitong-next
```

在部署目录创建 `.env.prod`：

```env
IMAGE_NAMESPACE=<registry-host>/<registry-namespace>
IMAGE_TAG=main-latest

WEB_DOMAIN=<web-domain>
ADMIN_DOMAIN=<admin-domain>

POSTGRES_USER=mianshitong_next
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=mianshitong_next
DATABASE_URL=postgresql://mianshitong_next:<strong-password>@db:5432/mianshitong_next?schema=public

MODEL_CONFIG_SECRET=<stable-random-secret>
```

注意：

- `DATABASE_URL` 必须是一整行。
- 生产容器通过 Compose service name 访问数据库，因此 host 使用 `db`。
- `.env.prod` 只放在服务器，不提交到 Git。

## DNS 与端口

将域名解析到服务器公网 IP：

```text
<web-domain>    A 记录 -> 服务器 IP
<admin-domain>  A 记录 -> 服务器 IP
```

Caddy 会监听 `80/443` 并自动处理 HTTPS 证书。

如果服务器上已有旧项目或 Nginx/Caddy 占用 `80/443`，新 Caddy 会启动失败。正式切换前先检查：

```bash
docker ps
ss -lntp | grep -E ':80|:443'
```

## 首次发布

本地提交并推送到 `main`：

```bash
git push origin main
```

或在 GitHub Actions 页面手动运行 `deploy` workflow。

发布成功后，在服务器查看状态：

```bash
cd /opt/mianshitong-next

docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  ps
```

健康检查：

```bash
curl -i https://<web-domain>/api/health
curl -i https://<admin-domain>/api/health
```

## 常用日志

```bash
cd /opt/mianshitong-next

docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  logs -f --tail=200 web

docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  logs -f --tail=200 admin

docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  logs -f --tail=200 caddy
```

## 常见失败

### 镜像仓库登录失败

现象：

```text
unauthorized: authentication required
```

排查：

1. 确认 `REGISTRY_HOST` 没有写协议、没有带 namespace。
2. 确认 `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` 能在本地或服务器 `docker login <registry-host>` 成功。
3. 阿里云 ACR 通常使用访问凭证里的用户名和固定密码，不一定是控制台登录密码。

### SSH 私钥无法解析

现象：

```text
Load key ".../deploy_key": error in libcrypto
```

排查：

1. `PROD_SSH_PRIVATE_KEY` 是否误填了 `.pub` 公钥。
2. 私钥是否包含完整头尾：`-----BEGIN OPENSSH PRIVATE KEY-----` / `-----END OPENSSH PRIVATE KEY-----`。
3. 私钥是否有 passphrase；CI 部署建议使用无 passphrase 的专用 deploy key。

### SSH 登录被拒绝

现象：

```text
Permission denied (publickey,...)
```

排查：

1. 本地执行 `ssh -i <deploy-key> -p <port> <user>@<host>` 是否能登录。
2. 服务器目标用户的 `~/.ssh/authorized_keys` 是否包含 deploy key 对应公钥。
3. `PROD_SSH_USER` 是否和公钥所在用户一致。

### 构建期缺 DATABASE_URL

现象：

```text
DATABASE_URL is required
```

背景：

- `prisma.config.ts` 会读取 `DATABASE_URL`。
- Dockerfile 的构建阶段已经提供占位 `DATABASE_URL`，如果再次出现该错误，优先检查 Dockerfile 是否是最新版本。

### 运行后健康检查失败

排查：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  ps
```

重点看：

- `db` 是否 healthy
- `web` / `admin` 是否 healthy
- `caddy` 是否启动失败或端口冲突

## 回滚

按指定镜像 tag 回滚：

```bash
cd /opt/mianshitong-next
bash scripts/rollback.sh <image_tag>
```

恢复 `main-latest`：

```bash
IMAGE_TAG=main-latest bash scripts/deploy.sh
```

## 安全提醒

- 不要提交 `.env.prod`、API Key、数据库密码或 SSH 私钥。
- 泄露过的密钥和密码应立即轮换。
- 正式替换旧项目之前，建议备份旧数据库和 Docker volume。
