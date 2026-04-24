# UI 包说明

`@mianshitong/ui` 负责跨 web/admin 复用的 UI 组件、App UI Provider、Ant Design 适配和 Markdown 渲染能力。

## 目录结构

```text
ui/
├── README.md
└── src/
    ├── index.ts
    ├── components/
    ├── hooks/
    ├── providers/
    └── utils/
```

## 职责划分

- `src/components/`
  - 通用 UI 组件，包括表单、布局、反馈、弹层、Markdown 等
- `src/providers/`
  - `AppUiProvider`、`AdminUiProvider`、Ant Design registry 和主题上下文
- `src/hooks/`
  - 仅服务于 UI 包内部或 UI 基础能力的 Hook
- `src/utils/`
  - UI 组件内部工具，例如弹层容器解析、运行环境判断
- `src/index.ts`
  - 对外稳定公开 API，同时聚合常用图标别名

## 开发约定

1. 本包只放跨应用复用的 UI 基础能力；业务组件优先留在对应 app 内。
2. 新增组件前先确认是否已有组件可组合完成，避免为单个页面新增伪公共组件。
3. 组件样式优先使用 `@mianshitong/tokens` 和 `@mianshitong/shared/ui` 中的能力，不在组件内扩散难维护的硬编码视觉规则。
4. 对外组件 API 保持小而稳定，避免过早增加大量变体、尺寸和布尔开关。
5. 根入口只导出稳定组件、类型和图标；组件内部工具默认不向外暴露。
6. 涉及 Ant Design、Next.js、Markdown 或 Shiki 等第三方 API 的改动，先确认最新文档和现有封装方式，再落代码。
