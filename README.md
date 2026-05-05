# Lint-Kit

一套基于社区实践的 lint 配置集合，旨在为 vue3 + ts 项目提供统一的配置。

> [!WARNING]
> 这个项目最初的目的是为了减少在使用 lint 工具时团队成员对代码风格的争论，同时避免多个项目 lint 规则维护困难的问题，我们希望开发者能够把更多精力放在业务本身，而不是纠结于各种风格差异。
>
> 不过需要说明的是，虽然大多数配置都采用了官方默认的规则，但其中不可避免的会包含一些个人喜好的规则。如果您有需要的话，也欢迎随时 fork 本项目。

## 安装

让我们开始吧，首先您需要在根目录下安装运行时依赖（最好是安装指定的版本）：

```bash
pnpm i -D eslint@9.39.4 stylelint@17.8.0 commitlint@20.3.0 czg@1.13.0
```

接下来安装统一的 lint 配置：

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
