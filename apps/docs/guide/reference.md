# 命令与配置

日常开发只需要记住一个命令即可：`lint-kit check` 检查项目。

## 初始化：init

```bash
pnpm lint-kit init
```

按提示选择需要的检查工具，工具配置会写入项目根目录；同名文件已存在时会保留，编辑器设置则会按所选工具更新。

## 检查与修复：check

```bash
pnpm lint-kit check
pnpm lint-kit check --fix
```

默认检查 Prettier、ESLint 和 Stylelint。**只有在项目目录找到对应配置时才会运行工具**，因此没有输出某个工具的结果，不代表该工具检查通过。

| 选项                  | 用途                                      |
| --------------------- | ----------------------------------------- |
| `--fix`               | 自动修复工具能够处理的问题                |
| `--prettier`          | 只运行 Prettier                           |
| `--eslint`            | 只运行 ESLint                             |
| `--stylelint`         | 只运行 Stylelint                          |
| `--commitlint <file>` | 校验指定文件中的提交信息                  |
| `[files...]`          | 指定文件、目录或 glob；省略时检查整个项目 |

显式选择工具后，只运行所选工具；可以组合多个选项：

```bash
pnpm lint-kit check --eslint --stylelint
pnpm lint-kit check --prettier --fix README.md
```

检查发现无法自动修复的问题时，需要根据终端中的文件位置和规则提示手动处理，再运行检查。

## 检查暂存文件：staged

```bash
pnpm lint-kit staged
```

只检查 Git 暂存文件，对常见代码、样式和文档文件执行 `check --fix`，修复成功后，变更会加入暂存区，提交前请检查差异。

需要指定 lint-staged 配置文件时使用：

```bash
pnpm lint-kit staged --config lint-staged.config.mjs
```

如何自动在提交前运行，见[工作流集成](/guide/workflow)。

## 指定目录与查看帮助

三个命令都支持 `--cwd <dir>`。路径以指定目录为基准：

```bash
pnpm lint-kit --help
pnpm lint-kit --version
pnpm lint-kit check --help
pnpm lint-kit check --cwd apps/web
```

## 单独使用配置包

如果已有自己的工具链，不需要使用 CLI，也可以只安装所需的规则配置：

| 配置包                     | 使用说明                             |
| -------------------------- | ------------------------------------ |
| `@kriac/eslint-config`     | [ESLint 配置](/guide/eslint)         |
| `@kriac/stylelint-config`  | [Stylelint 配置](/guide/stylelint)   |
| `@kriac/commitlint-config` | [Commitlint 配置](/guide/commitlint) |
