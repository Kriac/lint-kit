# Stylelint 配置

`@kriac/stylelint-config` 为 CSS、SCSS、Vue 与 HTML 中的样式提供共享规则，并且开箱即用，同时也可以继续使用 Stylelint 原生配置项覆盖规则。

## 快速开始

在已有项目中安装配置包与 Stylelint：

```bash
pnpm add -D @kriac/stylelint-config stylelint
```

在项目根目录的 `stylelint.config.mjs` 中启用：

```js
export default {
  extends: ["@kriac/stylelint-config"],
};
```

也可以安装 `@kriac/lint-kit`，运行 `pnpm lint-kit init` 并选择 Stylelint。

## 扩展配置

Stylelint 会将本地 `rules` 与扩展配置合并；本地值用于覆盖对应规则。例如，若项目希望统一类名格式，可以重新启用该规则：

```js
export default {
  extends: ["@kriac/stylelint-config"],
  rules: {
    "selector-class-pattern": "^[a-z][a-z0-9-]+$",
  },
};
```

## 参考

- [Stylelint 配置指南](https://stylelint.io/user-guide/configure)
- [Stylelint 规则参考](https://stylelint.io/user-guide/rules)
- [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss)
- [stylelint-config-recess-order](https://github.com/kutsan/stylelint-config-recess-order)
