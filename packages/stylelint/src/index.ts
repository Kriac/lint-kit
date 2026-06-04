import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default {
  extends: [
    "stylelint-config-recommended-vue",
    "stylelint-config-standard-scss",
    "stylelint-config-recess-order",
  ],
  plugins: ["stylelint-order"],
  overrides: [
    {
      files: ["**/*.html", "**/*.vue"],
      customSyntax: require.resolve("postcss-html"),
    },
  ],
  rules: {
    // 关闭空文件校验，部分组件可能没有样式
    "no-empty-source": null,
    // 关闭未知选择器校验，不同平台标签可能不同
    "selector-type-no-unknown": null,
    // 关闭类名格式校验，类名有很多设计规范，不做约束
    "selector-class-pattern": null,
    // 关闭重复选择器校验，部分情况下可以更好的维护代码
    "no-duplicate-selectors": null,
    // 关闭字体兜底校验，字体图标不能兜底
    "font-family-no-missing-generic-family-keyword": null,
  },
};
