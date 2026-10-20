# Commitlint 配置

`@kriac/commitlint-config` 提供了统一的提交信息规范配置，用于校验 Git 提交信息。

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

配置仅用于提交信息校验，不再提供交互式提交功能。原 `scopes` 选项已移除；如需限制提交范围，请配置 `scope-enum` 规则：

```js
import config from "@kriac/commitlint-config";

export default config({
  rules: {
    "scope-enum": [2, "always", ["docs"]],
  },
});
```

### `rules`

- 类型：`UserConfig["rules"]`（来自 `@commitlint/types`）
- 默认值：`{}`
- 说明：扩展或覆盖默认的 commitlint 规则。

## 默认规则

- `type-empty`: 必须填写提交类型
- `type-enum`: 提交类型必须在内置枚举范围内
