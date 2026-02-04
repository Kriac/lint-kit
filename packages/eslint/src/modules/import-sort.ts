import type { Linter } from "eslint";
import perfectionist from "eslint-plugin-perfectionist";

// 导入方式
// 类型 > 具名 > 副作用 > 通配符 > 默认
const importTypes = ["type", "named", "side-effect", "wildcard", "default"];

// 导入路径
// 内置模块 > 外部模块 > 父级相对 > 本级相对
const importScopes = ["builtin", "external", "internal", "parent", "sibling"];

// 导入规则
// 导入方式 > 导入路径
const importOrders = importTypes.map((type) => {
  return importScopes.map((scope) => {
    return `${type}-${scope}`;
  });
});

const config: Linter.Config = {
  plugins: {
    perfectionist,
  },
  rules: {
    "perfectionist/sort-imports": [
      "error",
      {
        type: "line-length",
        order: "asc",
        newlinesBetween: 0,
        groups: importOrders.flat(),
      },
    ],
  },
};

export default config;
