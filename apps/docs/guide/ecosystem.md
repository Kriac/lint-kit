# 插件生态

这里整理了 Lint Kit 直接依赖或重点参考过的项目，非常感谢所有的开源项目。

## ESLint

- [ESLint](https://github.com/eslint/eslint)：JS / TS 代码检查核心。
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)：TS 解析器与类型感知规则。
- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)：Vue 单文件组件规则集。
- [eslint-plugin-perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist)：导入、成员排序规则。
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)：关闭与 Prettier 冲突的规则。

## Stylelint

- [Stylelint](https://github.com/stylelint/stylelint)：CSS 代码检查核心。
- [stylelint-order](https://github.com/hudochenkov/stylelint-order)：样式属性排序规则。
- [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard)：标准规则预设。
- [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss)：SCSS 标准规则预设。
- [stylelint-config-recommended-vue](https://github.com/ota-meshi/stylelint-config-recommended-vue)：Vue 推荐规则预设。
- [stylelint-config-recess-order](https://github.com/stormwarning/stylelint-config-recess-order)：CSS 属性排序预设。
- [postcss-html](https://github.com/ota-meshi/postcss-html)：HTML / Vue 文件样式块解析器。

## Commitlint

- [Commitlint](https://github.com/conventional-changelog/commitlint)：校验 Commit Message 是否符合 Conventional Commits 规范。
- [czg](https://github.com/Zhengqbbb/cz-git)：交互式提交工具，引导生成规范提交信息。

## Prettier

- [Prettier](https://github.com/prettier/prettier)：统一代码格式化，支持 JS、TS、Vue、CSS、JSON、Markdown 等格式。

## Git 工程化

- [Husky](https://github.com/typicode/husky)：管理 Git Hook，在提交前自动触发 lint。
- [lint-staged](https://github.com/okonet/lint-staged)：只对暂存区文件执行 lint，避免全量扫描。
