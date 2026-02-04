import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue",
    "stylelint-config-recess-order",
  ],
  overrides: [
    {
      files: ["**/*.vue"],
      customSyntax: require.resolve("postcss-html"),
    },
  ],
  plugins: ["stylelint-order"],
  rules: {
    // 空文件校验 - 禁用原因: 部分组件可能没有样式
    "no-empty-source": null,
    // 未知选择器校验 - 禁用原因: 不同平台标签可能不同
    "selector-type-no-unknown": null,
    // 类名格式校验 - 禁用原因: 类名有很多设计规范，不做约束
    "selector-class-pattern": null,
    // 重复选择器校验 - 禁用原因: 部分情况下可以更好的维护代码
    "no-duplicate-selectors": null,
    // 字体兜底校验 - 禁用原因: 字体图标不能兜底
    "font-family-no-missing-generic-family-keyword": null,
  },
};
