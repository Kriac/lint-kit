# 工作流集成

本文档介绍如何建立规范化的开发工作流。

## 安装依赖

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
pnpm lint && pnpm lint-staged
```

这个钩子会：

- 运行 `pnpm lint` 进行全局 lint 检查
- 运行 `pnpm lint-staged` 对暂存的文件进行格式化和修复

**commit-msg 钩子** - 在提交消息阶段验证提交规范：

```bash
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

### 使用

使用 `pnpm commit` 命令代替 `git commit`：

```bash
pnpm commit
```

## 完整工作流

1. **修改代码** - 进行代码变更

   ```bash
   # 编辑文件
   vim src/index.ts
   ```

2. **暂存文件** - 使用 `git add` 暂存你的更改

   ```bash
   git add .
   ```

3. **提交代码** - 使用 `pnpm commit` 进行交互式提交

   ```bash
   pnpm commit
   ```

   - 这会触发 **pre-commit** 钩子，运行 lint 检查
   - 如果 lint 检查失败，提交会被中止
   - 修复问题后重新尝试提交
   - 如果通过，代码会被自动修复（如需要）并继续提交

4. **验证提交消息** - 提交消息会通过 **commit-msg** 钩子验证
   - commitlint 会检查提交消息是否符合规范
   - 符合规范的提交会被成功提交到版本库
