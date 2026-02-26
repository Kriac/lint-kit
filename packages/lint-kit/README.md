# @kriac/lint-kit

一套统一的 lint 规范集合

## 使用

### commitlint.config.mjs

```mjs
import config from "@kriac/lint-kit/commitlint";

export default config({
  scopes: [],
});
```

### eslint.config.mjs

```mjs
import config from "@kriac/lint-kit/eslint";

export default config({
  ignores: [],
});
```

### stylelint.config.mjs

```mjs
export default {
  extends: ["@kriac/lint-kit/stylelint"],
};
```

## 报告错误

欢迎提交 issue 与我们讨论。
