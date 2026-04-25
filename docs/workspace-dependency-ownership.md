# Workspace 依赖归属

Monorepo 中依赖声明遵循“谁直接使用，谁负责声明”。

## 规则

1. 根 `package.json` 只保留仓库级工具链依赖，例如 `typescript`、`eslint`、`prettier`、`commitlint`、`cspell`。
2. 应用运行时依赖必须声明在对应 app 或 package 自己的 `package.json` 中，不放在根目录兜底。
3. 共享包如果直接 `import` 某个第三方库，就必须在自己的 `package.json` 中声明：
   - 运行时需要时放 `dependencies`
   - 由消费方提供时放 `peerDependencies`
   - 为了本包本地开发和类型检查需要时，再补 `devDependencies`
4. 不要依赖 hoist 后“刚好能用”的状态，这会让包边界变得模糊，也会让后续拆包或发布时出问题。

## 当前落地

- 根 `package.json` 不再持有 `antd`、`@ant-design/*`、`@remixicon/react`、`react`、`react-dom` 这类应用运行时依赖。
- `packages/icons` 显式声明 `react` 的 peer/dev 依赖，避免继续依赖根目录兜底。
