# Tokens 包说明

`@mianshitong/tokens` 负责维护设计 token、主题覆盖和 Ant Design 主题映射。

## 稳定公开 API

- `spaceScale`、`radiusScale`、`shadowScale`
- `semanticTokens`
- `createThemeTokens`
- `createThemeVariablesStyleText`
- `createAntdTheme`
- `lightTheme`、`darkTheme`
- `webThemeOverrides`、`adminThemeOverrides`

## 开发约定

1. 应用层优先依赖语义 token 和主题工厂，不直接依赖内部目录结构。
2. 根入口只导出稳定能力，不通过 `export *` 暴露整个包内部实现。
3. 如果新增主题相关文件，先判断它是基础 token、主题覆盖还是 UI 框架映射，避免继续把所有内容混在一个层级里。
