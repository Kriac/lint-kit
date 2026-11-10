# 快速开始

本节将介绍如何使用 `@kriac/lint-kit` 检查项目代码。

## 安装

在项目根目录中执行：

```bash
pnpm add -D @kriac/lint-kit
```

添加 lint 命令 `package.json`：

```json
{
  "scripts": {
    "lint": "lint-kit check",
    "lint:fix": "lint-kit check --fix",
    "lint:staged": "lint-kit staged"
  }
}
```

然后执行初始化，选择需要的工具和编辑器集成：

```bash
pnpm lint-kit init
```

初始化会创建缺少的配置文件，不会覆盖已有的同名文件。

## 用法

```bash
pnpm lint-kit check
pnpm lint-kit check --fix
```

下一步可阅读 [工作流集成](/guide/workflow) 或查看各工具的 [配置说明](/guide/reference)。
