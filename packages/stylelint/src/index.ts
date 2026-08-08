import { fileURLToPath } from "node:url";

const resolveModule = (specifier: string) => {
  return fileURLToPath(import.meta.resolve(specifier));
};

export default {
  extends: [
    resolveModule("stylelint-config-standard-scss"),
    resolveModule("stylelint-config-recommended-vue"),
    resolveModule("stylelint-config-recess-order"),
  ],
  plugins: [resolveModule("stylelint-order")],
  overrides: [
    {
      files: ["**/*.html", "**/*.vue"],
      customSyntax: resolveModule("postcss-html"),
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
