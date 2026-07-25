# 工作流集成

## 安装依赖（建议固定版本）

首先您需要安装 husky、lint-staged 和 czg：

```bash
pnpm i -D husky@9.1.7 lint-staged@16.4.0 czg@1.13.0
```

## husky 配置

### 初始化 husky

在安装完所有依赖后，执行以下命令初始化 husky：

```bash
pnpm husky install
```

这会创建 `.husky` 目录并设置 Git 钩子。

### Git 钩子说明

项目配置以下钩子：

**pre-commit 钩子** - 在提交前运行 lint 检查：

```bash
#!/usr/bin/env sh
pnpm lint && pnpm lint-staged
```

这个钩子会：

- 运行 `pnpm lint` 进行全局 lint 检查
- 运行 `pnpm lint-staged` 对暂存的文件进行格式化和修复

**commit-msg 钩子** - 在提交消息阶段验证提交规范：

```bash
#!/usr/bin/env sh
pnpm commitlint --edit "$1"
```

这个钩子会检查提交消息是否符合 commitlint 规范。

## czg 与 commitizen

### 安装

czg 是 commitizen 的轻量适配版本，用于交互式地生成规范化的提交消息。

设置 `package.json` 中的 commitlint 配置地址：

```json
{
  "config": {
    "commitizen": {
      "czConfig": "commitlint.config.mjs"
    }
  }
}
```
