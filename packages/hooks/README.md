# Hooks 包说明

`@mianshitong/hooks` 负责跨 web/admin 复用的通用 React Hooks。

## 当前导出

- `useDebouncedValue`
  - 对输入值做防抖同步
- `useFocusAtEnd`
  - 聚焦输入元素并把光标移动到末尾
- `useScrollRestoration`
  - 保存和恢复滚动位置
- `useTransientFlag`
  - 管理短暂状态标记，例如复制成功提示

## 开发约定

1. 只放与业务无关、可在多个应用或组件中复用的 Hook。
2. 业务流程型 Hook 优先留在对应 app 内，例如 chat、auth、admin list 等领域逻辑不要放进本包。
3. 新增 Hook 前先确认至少有明确复用价值；单处使用的局部交互逻辑不要提前抽到共享包。
4. Hook 文件使用 `use-xxx.ts` 命名，根入口 `src/index.ts` 只导出稳定 API。
5. 本包依赖 React 时保持 `peerDependencies` 声明，避免把 React 运行时重复打进共享包。
