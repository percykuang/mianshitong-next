# 同服双项目部署约定

本文档记录 `mianshitong-next` 与其他站点共同部署在同一台服务器时的长期推荐方案。当前重点场景是：

- `mianshitong.chat`
- `admin.mianshitong.chat`
- `percy.ren`
- `admin.percy.ren`

它们共享同一台服务器，并统一通过 Caddy 处理公网 `80/443` 入口。

## 当前结论

当前仓库已经不再负责生产公网入口 Caddy 的部署与配置同步。

也就是说：

- `mianshitong-next` 只负责部署自己的 `db`、`migrate`、`web`、`admin`
- 生产环境的公网 `80/443` 入口由独立的 `edge-proxy` 目录或独立 infra 仓库负责
- 本仓库只需要保证 `web` / `admin` 挂到共享 `edge` 网络，并暴露稳定别名：
  - `mianshitong-web`
  - `mianshitong-admin`

## 背景

当服务器上只部署单个项目时，让项目自己的 `caddy` 容器直接监听：

```text
80
443
```

是最简单的方式。

但当同一台服务器同时承载多个独立项目时，如果每个项目都各自启动一个绑定 `80/443` 的 Caddy，就会出现下面这些问题：

- 新项目发布时抢占 `80/443`
- 旧项目域名没有被新 Caddy 配置，导致线上不可访问
- 每个项目都各自管理一份公网入口配置，排查成本高
- HTTPS 证书、反向代理规则和域名切换分散在多个仓库里

这次 `percy.ren` 无法访问，本质上就是：

- `mianshitong-next` 的 `caddy` 接管了公网 `80/443`
- 但配置里只有 `mianshitong.chat` 与 `admin.mianshitong.chat`
- 没有 `percy.ren` 与 `admin.percy.ren`

## 推荐架构

长期推荐保留一层“统一入口代理”：

```text
Internet
  -> server public 80/443
  -> edge caddy
     -> mianshitong web/admin
     -> percy web/admin
```

角色划分：

- 统一入口 Caddy
  - 唯一监听公网 `80/443`
  - 统一管理证书
  - 统一配置全部域名路由
- 各业务项目容器
  - 只暴露内部端口，例如 `3000`
  - 不再直接绑定宿主机 `80/443`
  - 通过共享 Docker 网络给统一入口 Caddy 访问

## 网络约定

约定服务器存在一个共享 Docker 网络：

```text
edge
```

创建方式：

```bash
docker network create edge
```

只需要创建一次。之后所有需要被统一入口代理访问的业务容器，都要加入该网络。

## 域名路由约定

当前建议由统一入口 Caddy 管理以下域名：

```text
percy.ren
admin.percy.ren
mianshitong.chat
admin.mianshitong.chat
```

示例配置：

```caddyfile
percy.ren {
  encode zstd gzip
  reverse_proxy percy-web:3000
}

admin.percy.ren {
  encode zstd gzip
  reverse_proxy percy-admin:3000
}

mianshitong.chat {
  encode zstd gzip
  reverse_proxy mianshitong-web:3000
}

admin.mianshitong.chat {
  encode zstd gzip
  reverse_proxy mianshitong-admin:3000
}
```

重点：

- 一个域名只应在一份公网入口 Caddy 配置里出现
- 不要让两个独立 Caddy 同时争抢同一批公网域名

## `mianshitong-next` 的部署边界

如果本项目运行在“同服多项目”场景下，应遵守以下边界：

1. `web` 与 `admin` 只通过 `expose: 3000` 提供内部访问能力。
2. `web` 与 `admin` 都必须加入共享 `edge` 网络。
3. `web` 在 `edge` 网络上暴露稳定别名 `mianshitong-web`。
4. `admin` 在 `edge` 网络上暴露稳定别名 `mianshitong-admin`。
5. 本仓库不再负责公网 `80/443` 的 Caddy 配置。

## 容器命名与反代目标

长期有两种写法。

### 方案 A：使用共享网络别名，推荐

优先使用稳定别名，而不是直接写容器实例名。

例如：

```text
percy-web
percy-admin
mianshitong-web
mianshitong-admin
```

优点：

- 重建容器后路由目标不变
- compose 扩缩容或重建时更稳定
- 文档和配置更容易理解

### 方案 B：直接写容器名，临时救火可用

例如：

```text
percy-site-prod-web-1
percy-site-prod-admin-1
```

缺点：

- 容器名和实例编号耦合
- 重建或工程调整后更容易失效

因此，本项目的长期目标是逐步收敛到共享网络别名，而不是继续依赖实例名。

## 推荐的共享别名方案

建议：

- `mianshitong-next` 的 `web` 在 `edge` 网络上暴露别名 `mianshitong-web`
- `mianshitong-next` 的 `admin` 在 `edge` 网络上暴露别名 `mianshitong-admin`
- `percy-site` 的 `web` 在 `edge` 网络上暴露别名 `percy-web`
- `percy-site` 的 `admin` 在 `edge` 网络上暴露别名 `percy-admin`

而域名到 upstream 的映射统一收敛到独立 `edge-proxy` 的 `Caddyfile` 中。

## 发布约定

在同服多项目场景下，发布前必须检查：

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
ss -lntp | grep -E ':80|:443'
```

确认点：

1. 当前到底是谁在监听 `80/443`
2. 新部署是否会替换掉正在服务其他域名的入口代理
3. 新的 `Caddyfile` 是否包含服务器上全部仍需对外服务的域名

发布后验证：

```bash
curl -I https://percy.ren
curl -I https://admin.percy.ren
curl -I https://mianshitong.chat
curl -I https://admin.mianshitong.chat
```

## 故障排查顺序

如果某个站点突然无法访问，建议按以下顺序排查：

1. 看 `80/443` 当前被哪个入口代理容器占用。
2. 看独立 `edge-proxy` 的配置里是否包含故障域名。
3. 看被代理的目标容器本身是否 healthy。
4. 看 `web` / `admin` 是否仍然挂在 `edge` 网络并保留稳定别名。
5. 看入口 Caddy 日志里是否出现域名、TLS、ACME、challenge 相关报错。

推荐命令：

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
ss -lntp | grep -E ':80|:443'
docker logs --tail=200 <edge-proxy-caddy>
docker inspect mianshitong-next-prod-web-1 --format '{{json .NetworkSettings.Networks.edge.Aliases}}'
docker inspect mianshitong-next-prod-admin-1 --format '{{json .NetworkSettings.Networks.edge.Aliases}}'
curl -I http://<domain>
curl -I https://<domain>
```

对同服多项目场景，最终推荐结论是：

- 服务器上只能有一个真正接管公网 `80/443` 的独立 Caddy
- 入口 Caddy 必须统一管理全部对外域名
- 所有业务项目容器通过共享 `edge` 网络暴露给入口代理
- 长期优先使用稳定网络别名，不依赖容器实例名
- 业务仓库不再同时承担“项目代码仓库 + 全站公网入口配置仓库”两种职责
