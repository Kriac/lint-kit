# 工作流集成

## 安装依赖（建议固定版本）

首先您需要安装 husky、lint-staged、prettier 和 czg：

```bash
pnpm i -D prettier@3.7.2 lint-staged@16.4.0 husky@9.1.7 czg@1.13.0
```

## 配置 lint-staged 与 prettier

lint-staged 只对暂存区中的文件执行格式化和修复，prettier 则用于统一格式化代码。将以下配置添加到 `package.json`：

```json
{
  "scripts": {
    "format": "prettier --write ."
  },
  "lint-staged": {
    "*.vue": ["eslint --fix", "stylelint --fix", "prettier --write"],
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{json,yaml,md}": ["prettier --write"]
  }
}
```

需要格式化整个项目时，执行：

```bash
pnpm format
```

## 配置 husky

执行命令初始化 husky：

```bash
pnpm husky install
```

这会创建 `.husky` 目录，在目录中创建以下两个无扩展名的钩子文件：

```text
.husky/
├── commit-msg
└── pre-commit
```

### `.husky/commit-msg`

在提交消息阶段验证提交信息是否符合 commitlint 规范：

```bash
#!/usr/bin/env sh
pnpm commitlint --edit "$1"
```

### `.husky/pre-commit`

在提交前运行 lint 检查，并格式化和修复暂存文件：

```bash
#!/usr/bin/env sh
pnpm lint && pnpm lint-staged
```

这个钩子会：

- 运行 `pnpm lint` 进行全局 lint 检查
- 运行 `pnpm lint-staged` 对暂存的文件进行格式化和修复

## 配置 czg 与 commitizen

czg 是 commitizen 的轻量级替代方案，同时支持交互式地生成规范化的提交消息。

在 `package.json` 中配置地址：

```json
{
  "config": {
    "commitizen": {
      "czConfig": "commitlint.config.mjs"
    }
  }
}
```
