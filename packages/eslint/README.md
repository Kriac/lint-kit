# @kriac/eslint-config

用于 eslint 的统一配置插件

## 使用

### eslint.config.mjs

```mjs
import config from "@kriac/eslint-config";

export default config({
  ignores: [],
});
```

### 选项

- ignores: 用于扩展忽略文件的数组，默认包含 node_modules 和 dist。

## 报告错误

欢迎提交 issue 与我们讨论。
