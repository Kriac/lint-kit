# ESLint 配置

`@kriac/eslint-config` 提供了预配置的 ESLint 规则集，支持 Vue 和 TypeScript。

## 使用

### eslint.config.mjs

```js
import config from "@kriac/eslint-config";

export default config({
  // 参考类型 PluginOptions
});
```

## 选项

### `ignores`

- 类型：`string[]`
- 默认值：`["node_modules", "dist"]`

用于扩展忽略文件的数组，默认已包含 `node_modules` 和 `dist`。

### `configs`

- 类型：`Config[]`

自定义 ESLint 扁平化配置，会追加到内置配置之后。
