# Stylelint Config

为 CSS、SCSS、Vue 和 HTML 中的样式提供统一检查规则，并支持按项目需要扩展。

## 快速开始

安装配置包和 Stylelint：

```bash
pnpm add -D @kriac/stylelint-config stylelint
```

在 `stylelint.config.mjs` 中启用：

```js
export default {
  extends: ["@kriac/stylelint-config"],
};
```

## 文档

查看 [Stylelint 配置指南](https://kriac.github.io/lint-kit/guide/stylelint)。
