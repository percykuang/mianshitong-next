# Admin 运维手册

本文档记录 Admin 后台的生产运维操作，重点包括管理员账号创建、密码重置和登录失败排查。

## 数据模型

后台管理员存储在 Prisma 的 `AdminUser` 表：

```text
AdminUser
  id
  email
  passwordHash
  createdAt
  updatedAt
```

后台登录逻辑会：

1. 将输入邮箱 `trim().toLowerCase()`。
2. 通过 `AdminUser.email` 查询管理员。
3. 使用 `apps/admin/server/auth/password.ts` 中的 scrypt 规则验证密码。

`passwordHash` 格式：

```text
scrypt$<salt>$<hex-hash>
```

正常长度约为 `168`。

## 创建或重置管理员密码

以下命令在服务器部署目录执行：

```bash
cd /opt/mianshitong-next
```

先生成 hash。将 `<admin-password>` 替换为临时密码，执行后复制输出的完整 `scrypt$...$...`：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  run --rm \
  migrate \
  node -e 'const { randomBytes, scryptSync } = require("node:crypto"); const password = "<admin-password>"; const salt = randomBytes(16).toString("hex"); const hash = scryptSync(password, salt, 64).toString("hex"); console.log(["scrypt", salt, hash].join("$"))'
```

如果管理员已存在，更新密码：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  exec -T \
  db \
  sh <<'SH'
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
UPDATE "AdminUser"
SET "passwordHash" = '这里粘贴完整 scrypt hash',
    "updatedAt" = now()
WHERE "email" = '<admin-email>';
SQL
SH
```

如果管理员不存在，插入管理员：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  exec -T \
  db \
  sh <<'SH'
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
INSERT INTO "AdminUser" ("id", "email", "passwordHash", "createdAt", "updatedAt")
VALUES (
  concat('admin_', md5(random()::text || clock_timestamp()::text)),
  '<admin-email>',
  '这里粘贴完整 scrypt hash',
  now(),
  now()
)
ON CONFLICT ("email")
DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "updatedAt" = now();
SQL
SH
```

注意：

- `scrypt$...$...` 中包含 `$`，不要直接放在普通双引号 shell 命令里，否则会被 shell 展开破坏。
- 推荐使用上面的 single-quoted heredoc 写入。

## 验证管理员记录

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  exec -T \
  db \
  sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -c "SELECT \"email\", left(\"passwordHash\", 20), length(\"passwordHash\") FROM \"AdminUser\";"'
```

正常输出应满足：

- `email` 是小写邮箱
- `passwordHash` 以 `scrypt$` 开头
- `length` 约为 `168`

## 登录失败排查

### 邮箱或密码错误

优先检查数据库里的 `passwordHash`：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  exec -T \
  db \
  sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT \"email\", left(\"passwordHash\", 20) AS hash_prefix, length(\"passwordHash\") AS hash_length, \"updatedAt\" FROM \"AdminUser\";"'
```

常见异常：

- `hash_length = 0`：密码 hash 没写进去。
- `hash_prefix` 不是 `scrypt$`：hash 被 shell 展开或复制错误。
- `hash_length` 不是约 `168`：hash 可能不完整。

### 检查 Admin 容器连接的数据库

如果数据库记录正常但仍无法登录，确认 admin 容器连接的是同一个数据库：

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  exec -T \
  admin \
  sh -c 'echo "$DATABASE_URL"'
```

生产环境应使用 `@db:5432` 作为数据库 host。

### 查看后台日志

```bash
docker compose \
  --project-name mianshitong-next-prod \
  --env-file .env.prod \
  -f compose.prod.yml \
  logs -f --tail=200 admin
```

## 安全建议

- 初始化成功后及时更换临时密码。
- 不要把真实管理员邮箱、密码、hash 写入仓库文档。
- 泄露过的生产密码应立即重置。
