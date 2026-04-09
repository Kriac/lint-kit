# IDE 支持

## VS Code 插件

请安装以下 VS Code 插件：

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)

## 编辑器设置

请将以下配置添加到 `.vscode/settings.json`：

```json
{
  "stylelint.validate": ["html", "css", "vue", "scss"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  }
}
```
