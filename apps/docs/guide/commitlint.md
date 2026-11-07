# Commitlint 配置

`@kriac/commitlint-config` 提供提交信息校验规则，可单独用于 Commitlint。

## 快速开始

安装配置包与 Commitlint CLI：

```bash
pnpm add -D @kriac/commitlint-config @commitlint/cli
```

在项目根目录的 `commitlint.config.mjs` 中启用：

```js
import config from "@kriac/commitlint-config";

export default config();
```

## 默认校验

默认规则要求提交类型非空，且类型必须来自以下列表：

`feat`、`fix`、`style`、`refactor`、`perf`、`test`、`ci`、`docs`、`chore`、`revert`

例如：

```text
feat: add search
fix: handle empty input
docs: update setup guide
```

以上是常见的 Conventional Commits 写法。当前配置默认只校验类型非空和类型是否在允许列表内；scope、subject 是否为空、标点及标题长度等要求，可在项目中另行配置。

## 自定义规则

配置工厂接受 Commitlint 的 `rules`，项目规则会覆盖默认值。例如要求提交主题非空：

```js
import config from "@kriac/commitlint-config";

export default config({
  rules: {
    "subject-empty": [2, "never"],
  },
});
```

## 参考

- [Commitlint 配置文档](https://commitlint.js.org/reference/configuration.html)
- [Commitlint 规则参考](https://commitlint.js.org/reference/rules.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
