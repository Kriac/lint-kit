# 工作流集成

推荐使用 husky 为你的项目实现 Git 提交钩子。

## 安装

在项目根目录中执行：

```bash
pnpm i -D husky
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
pnpm lint-kit check --commitlint "$1"
```

### `.husky/pre-commit`

在提交前运行 lint 检查，并格式化和修复暂存文件：

```bash
#!/usr/bin/env sh
pnpm lint:staged
```
