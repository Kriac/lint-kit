# Commitlint 配置

`@kriac/commitlint-config` 提供了规范化的 Git 提交信息配置，内置 czg 交互式提交支持。

## 使用

### commitlint.config.mjs

```js
import config from "@kriac/commitlint-config";

export default config({
  // 参考类型 PluginOptions
});
```

## 选项

### `scopes`

- 类型：`{ name: string; value: string }[]`
- 默认值：`[]`

用于配置提交范围列表，在 czg 交互式提交时会作为可选项展示。

### `rules`

可额外扩展的自定义 commitlint 规则。
