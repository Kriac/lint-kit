# Lint-Kit

一个基于社区实践的 lint 配置集合，旨在为 vue3 + ts 项目提供统一的配置。

> [!WARNING]
> 这个项目最初的目的是减少在配置 lint 规则时需要安装和学习大量复杂规则的负担。我们希望开发者能够把更多精力放在业务本身，而不是纠结于各种格式差异。
>
> 不过需要说明的是，虽然大多数配置都采用了官方或社区的默认规则，但其中仍然包含一些个人偏好（例如排序规则）。如果您有需要的话，欢迎随时 fork 本项目。

## 安装

让我们开始吧，首先您需要在根目录下安装运行时依赖：

```bash
pnpm i -D eslint stylelint commitlint czg
```

接下来安装统一的配置依赖：

```bash
pnpm i -D @kriac/lint-kit
```

## 配置

### eslint.config.mjs

```js
import config from "@kriac/eslint-config";

export default config({
  // ...
});
```

### stylelint.config.mjs

```js
export default {
  extends: ["@kriac/stylelint-config"],
};
```

### commitlint.config.mjs

```js
import config from "@kriac/commitlint-config";

export default config({
  // ...
});
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
    "lint:style": "stylelint **/*.{html,vue,css,scss} --fix"
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

## IDE 支持

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

## 使用

如果你在开发过程中遇到了什么问题，或者有更好的建议，欢迎提交 issue 与我们讨论。

## 贡献

首先感谢你考虑为本项目做出贡献！我们欢迎社区成员的贡献，以帮助改进和扩展本项目。

## 执照

本项目采用 MIT 许可证，详细内容请见 [LICENSE](LICENSE) 文件。
