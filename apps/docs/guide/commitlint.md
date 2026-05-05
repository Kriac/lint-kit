# Commitlint 配置

`@kriac/commitlint-config` 提供了统一的提交信息规范配置，同时使用 `czg` 工具可以实现交互式的 commit 信息流程。

内置配置包括：

- `Conventional Commits type`

## 配置

### commitlint.config.mjs

```js
import config from "@kriac/commitlint-config";

export default config({
  // ...
});
```

### 自定义 scope

```js
import config from "@kriac/commitlint-config";

export default config({
  scopes: [
    { name: "docs: 文档", value: "docs" },
    { name: "demo: 示例应用", value: "demo" },
  ],
});
```

### 扩展 rules

```js
import config from "@kriac/commitlint-config";

export default config({
  rules: {
    "scope-empty": [2, "never"],
    "subject-empty": [2, "never"],
  },
});
```

## 选项

### `scopes`

- 类型：`{ name: string; value: string }[]`
- 默认值：`[]`
- 说明：扩展可选的提交范围列表。

### `rules`

- 类型：`UserConfig["rules"]`
- 默认值：`{}`
- 说明：扩展或覆盖默认的 commitlint 规则。

## 默认规则

- `type-empty`: 必须填写提交类型
- `type-enum`: 提交类型必须在内置枚举范围内

## 跳过问题

- `body`
- `breaking`
- `footerPrefix`
- `footer`
