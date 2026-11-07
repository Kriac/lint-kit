# Commitlint Config

统一 Git 提交信息格式，默认提供常见提交类型，并支持按团队需要扩展规则。

## 快速开始

安装配置包和 Commitlint：

```bash
pnpm add -D @kriac/commitlint-config @commitlint/cli
```

在 `commitlint.config.mjs` 中启用：

```js
import config from "@kriac/commitlint-config";

export default config();
```

## 文档

查看 [Commitlint 配置指南](https://kriac.github.io/lint-kit/guide/commitlint)。
