import type { Feature, Stat } from "../types";

export const FEATURES: Feature[] = [
  {
    title: "ESLint",
    icon: "🔍",
    desc: "预配置的 ESLint 规则集",
    details: "支持 Vue、TypeScript，开箱即用的 ESLint 配置方案",
    filename: "eslint.config.mjs",
    code: `import config from "@kriac/eslint-config";
export default config({
  // 参考类型 PluginOptions
});`,
  },
  {
    title: "Stylelint",
    icon: "🎨",
    desc: "统一的 CSS/SCSS 样式规范",
    details: "支持 Vue 单文件组件的完整样式检查方案",
    filename: "stylelint.config.mjs",
    code: `export default {
  extends: ["@kriac/stylelint-config"],
};`,
  },
  {
    title: "Commitlint",
    icon: "📝",
    desc: "规范化 Git 提交信息",
    details: "内置 czg 交互式提交支持，确保提交信息格式统一",
    filename: "commitlint.config.mjs",
    code: `import config from "@kriac/commitlint-config";
export default config({
  // 参考类型 PluginOptions
});`,
  },
];

export const STATS: Stat[] = [
  { value: "Vue 3 + TS", label: "完全支持" },
  { value: "100%", label: "开箱即用" },
  { value: "6KB", label: "体积轻量" },
];
