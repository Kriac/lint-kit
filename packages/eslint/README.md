# ESLint Config

为 JavaScript、TypeScript、Vue 和 JSX/TSX 项目提供统一的 ESLint 规则，并支持按项目需要扩展。

## 快速开始

安装配置包和 ESLint：

```bash
pnpm add -D @kriac/eslint-config eslint
```

在 `eslint.config.mjs` 中启用：

```js
import config from "@kriac/eslint-config";

export default config();
```

## 文档

查看 [ESLint 配置指南](https://kriac.github.io/lint-kit/guide/eslint)。
