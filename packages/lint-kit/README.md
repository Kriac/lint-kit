# Lint Kit

一个命令统一运行 ESLint、Stylelint、Prettier 和 Commitlint。

## 快速开始

在项目根目录执行：

```bash
pnpm add -D @kriac/lint-kit
pnpm lint-kit init
pnpm lint-kit check
```

`init` 会引导选择工具并生成缺失的配置文件。日常检查使用 `pnpm lint-kit check --fix` 自动修复即可。

## 文档

请参考 [入门指南](https://kriac.github.io/lint-kit/guide/getting-started)
