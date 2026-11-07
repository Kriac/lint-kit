# ESLint 配置

`@kriac/eslint-config` 为 JavaScript、TypeScript、Vue 与 TSX 项目提供可扩展的 ESLint Flat Config，并且开箱即用，规则基于 ESLint 与 typescript-eslint 推荐配置，包含 Vue 推荐规则、Perfectionist 排序规则和 Prettier 冲突处理。

## 快速开始

在已有项目中安装配置包与 ESLint：

```bash
pnpm add -D @kriac/eslint-config eslint
```

在项目根目录的 `eslint.config.mjs` 中启用：

```js
import config from "@kriac/eslint-config";

export default config();
```

也可以安装 `@kriac/lint-kit`，运行 `pnpm lint-kit init` 并选择 ESLint。

## 扩展配置

通过 `ignores` 增加忽略模式，通过 `configs` 追加标准 ESLint Flat Config 片段。追加片段位于基础规则之后，可用于按文件定制或覆盖规则：

```js
import config from "@kriac/eslint-config";

export default config({
  ignores: ["coverage/**"],
  configs: [
    {
      files: ["src/**/*.ts"],
      rules: { "no-console": "warn" },
    },
  ],
});
```

## 参考

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)
- [eslint-plugin-perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist)
