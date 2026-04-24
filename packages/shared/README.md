# Shared 包说明

`@mianshitong/shared` 提供跨应用复用的最小共享能力。当前按语义拆成三类入口：

- `@mianshitong/shared/constants`
  - 纯常量
- `@mianshitong/shared/runtime`
  - 与运行时、日志、JSON 安全解析/序列化、请求解析、重试相关的工具
- `@mianshitong/shared/ui`
  - 面向 UI 的轻量工具，例如 `cn`

## 开发约定

1. 优先从最窄的子入口导入，不要默认全都从包根导入。
2. 新增共享能力前，先判断它属于 `constants`、`runtime` 还是 `ui`，不要继续堆进泛化的 `utils` 目录认知里。
3. 包根入口仅作为兼容层和聚合层存在，不作为新增代码的首选导入位置。
