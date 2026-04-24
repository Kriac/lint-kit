# Lint Kit

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

## 文档

- [说明文档](https://kriac.github.io/lint-kit/)
