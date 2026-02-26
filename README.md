# Lint-Kit

一个基于社区实践的 lint 配置集合，旨在为前端项目提供统一的配置。

## 使用

如果你在开发过程中遇到了什么问题，或者有更好的建议，欢迎提交 issue 与我们讨论。

### 安装

- @kriac/lint-kit: 统一 lint 配置
- commitlint: git 提交内容检查
- eslint: 代码检查
- stylelint: css 样式检查

在根目录下安装所需依赖：

```bash
pnpm i -D commitlint eslint stylelint
```

安装统一的配置文件插件：

```bash
pnpm i -D @kriac/lint-kit
```

### 推荐

建议安装下面这几个包，可用于大幅提升开发体验。

```bash
pnpm i -D husky czg lint-staged vue-tsc prettier
```

### 配置

### commitlint.config.mjs

```mjs
import config from "@kriac/commitlint-config";

export default config({
  // 参考类型 PluginOptions
});
```

### eslint.config.mjs

```mjs
import config from "@kriac/eslint-config";

export default config({
  // 参考类型 PluginOptions
});
```

### stylelint.config.mjs

```mjs
export default {
  extends: ["@kriac/stylelint-config"],
};
```

### package.json

以下是根目录的 `package.json` 配置：

```json
{
  "scripts": {
    "prepare": "husky",
    "commit": "czg",
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm lint-staged",
    "lint:es": "eslint --fix",
    "lint:style": "stylelint **/*.{vue,css,scss} --fix"
  },
  "config": {
    "commitizen": {
      "czConfig": "commitlint.config.mjs"
    }
  },
  "lint-staged": {
    "*.vue": ["eslint --fix", "stylelint --fix", "prettier --write"],
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{json,yaml,md}": ["prettier --write"]
  }
}
```

### IDE 支持

请安装 vscode 插件:

1. [Eslint 插件](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Stylelint 插件](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)

请将以下设置添加到你的设置中 `.vscode/settings.json`:

```json
{
  "stylelint.validate": ["html", "css", "vue", "scss"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  }
}
```

## 贡献

感谢你考虑为 @kriac/lint-kit 项目做贡献！我们欢迎社区成员的贡献，以帮助改进和扩展该项目。

## 执照

本项目采用 MIT 许可证，详细内容请见 [LICENSE](LICENSE) 文件。
