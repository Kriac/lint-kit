# ESLint 配置

`@kriac/eslint-config` 提供了预配置的 ESLint 规则集，支持 Vue、TypeScript 和 JSX/TSX，并集成常用的导入排序与 Prettier 兼容配置。

内置配置包括：

- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-vue`
- `eslint-plugin-perfectionist`
- `eslint-config-prettier`

## 配置

### eslint.config.mjs

```js
import config from "@kriac/eslint-config";

export default config({
  // ...
});
```

### 自定义忽略文件

```js
import config from "@kriac/eslint-config";

export default config({
  ignores: ["coverage/**", "playground/**"],
});
```

### 扩展 flat config

```js
import config from "@kriac/eslint-config";

export default config({
  configs: [
    {
      files: ["src/**/*.ts"],
      rules: {
        "no-console": "warn",
      },
    },
  ],
});
```

## 选项

### `ignores`

- 类型：`string[]`
- 默认值：`[]`
- 说明：扩展全局忽略文件或目录。默认额外忽略 `node_modules` 和 `dist`。

### `configs`

- 类型：`Config[]`
- 默认值：`[]`
- 说明：追加自定义的 ESLint Flat Config 配置片段。

## 默认关闭的规则

- `no-undef`: 全局变量交由 TypeScript 校验
- `@typescript-eslint/no-empty-object-type`: 允许在扩展接口等场景下使用空对象类型
- `vue/valid-template-root`: 兼容部分没有模板子节点的 Vue 单文件场景
- `vue/multi-word-component-names`: 兼容单词组件名场景
