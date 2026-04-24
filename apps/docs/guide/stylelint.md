# Stylelint 配置

`@kriac/stylelint-config` 提供了统一的 CSS / SCSS 样式规范配置，支持 Vue 单文件组件与 HTML 中的样式块，并集成常用的属性排序规则。

内置配置包括：

- `stylelint-config-standard`
- `stylelint-config-standard-scss`
- `stylelint-config-recommended-vue`
- `stylelint-config-recess-order`
- `stylelint-order`

## 配置

### stylelint.config.mjs

```js
export default {
  extends: ["@kriac/stylelint-config"],
};
```

### 扩展 rules

```js
export default {
  extends: ["@kriac/stylelint-config"],
  rules: {
    "color-hex-length": "short",
    "declaration-no-important": true,
  },
};
```

### 覆盖特定文件

```js
export default {
  extends: ["@kriac/stylelint-config"],
  overrides: [
    {
      files: ["src/theme/**/*.css"],
      rules: {
        "selector-class-pattern": "^[a-z][a-z0-9-]+$",
      },
    },
  ],
};
```

## 默认扩展配置

- `stylelint-config-standard`
- `stylelint-config-standard-scss`
- `stylelint-config-recommended-vue`
- `stylelint-config-recess-order`

## 使用到的插件

- `stylelint-order`

## 默认关闭的规则

- `no-empty-source`: 兼容没有样式内容的文件
- `selector-type-no-unknown`: 兼容不同平台或框架的自定义标签
- `selector-class-pattern`: 不强制约束类名命名风格
- `no-duplicate-selectors`: 允许部分便于维护的重复选择器写法
- `font-family-no-missing-generic-family-keyword`: 兼容字体图标等场景
