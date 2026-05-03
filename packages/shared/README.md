# Shared 包说明

`@mianshitong/shared` 提供跨应用复用的最小共享能力。当前按语义拆成四类入口：

- `@mianshitong/shared/constants`
  - 纯常量
- `@mianshitong/shared/server`
  - 仅服务端使用的 workspace env 加载与环境变量读取工具
- `@mianshitong/shared/runtime`
  - 与公开运行时环境、日志、JSON 安全解析/序列化、请求解析、重试相关的工具，且实现也收敛在 `src/runtime/`
- `@mianshitong/shared/ui`
  - 面向 UI 的轻量工具，例如 `cn`

## 开发约定

1. 优先从最窄的子入口导入，不要默认全都从包根导入。
2. 新增共享能力前，先判断它属于 `constants`、`runtime` 还是 `ui`，不要继续堆进泛化的 `utils` 目录认知里。
3. 包根入口仅作为兼容层和聚合层存在，不作为新增代码的首选导入位置。
4. `NODE_ENV` 这类公开运行时判断放在 `runtime`；`.env` 文件加载、密钥和敏感配置读取放在 `server`。
5. `utils` 只保留暂时不适合单独子入口的内部小工具；如果某类能力已经形成稳定语义，应优先提升到对应目录，而不是继续挂在 `utils` 下。

## 目录建议

```text
src/
  constants/  # 常量定义与 barrel
  runtime/    # 运行时通用能力，根层放 cache/env/logger/retry，复杂能力按 json/network 分组
  server/     # 仅服务端能力，实现与 barrel 同目录
  ui/         # UI 轻量工具，实现与 barrel 同目录
  index.ts    # 兼容性聚合出口
```
