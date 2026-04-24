# Lint-Kit

一个基于社区实践的 lint 配置集合，旨在为 vue3 + ts 项目提供统一的配置。

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
