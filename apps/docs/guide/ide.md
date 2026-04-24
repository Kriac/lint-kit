# IDE 支持

为了在编辑器中获得实时的错误提示与保存时自动修复能力，推荐为 VS Code 安装对应插件并进行以下配置。

## VS Code 插件

请安装以下 VS Code 插件：

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) — 提供 ESLint 规则的实时提示与自动修复
2. [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) — 提供样式规则的实时提示与自动修复
3. [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — 提供代码格式化支持

## 编辑器设置

请将以下配置添加到 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "stylelint.validate": ["html", "css", "vue", "scss"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  }
}
```

### 配置说明

| 配置项                    | 说明                                      |
| ------------------------- | ----------------------------------------- |
| `editor.formatOnSave`     | 保存时自动格式化，由 Prettier 执行        |
| `editor.defaultFormatter` | 将 Prettier 设为默认格式化器              |
| `stylelint.validate`      | 指定 Stylelint 校验的文件类型             |
| `source.fixAll.eslint`    | 保存时自动修复 ESLint 可自动修复的问题    |
| `source.fixAll.stylelint` | 保存时自动修复 Stylelint 可自动修复的问题 |

## 推荐扩展配置

可将以下内容保存到 `.vscode/extensions.json`，让团队成员在打开项目时收到插件安装提示：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint",
    "esbenp.prettier-vscode"
  ]
}
```
