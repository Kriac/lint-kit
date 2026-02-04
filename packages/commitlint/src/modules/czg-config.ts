import type { Optional } from "../types";

/** 默认类型 */
export const types: Optional[] = [
  {
    name: "feat: 新功能",
    value: "feat",
  },
  {
    name: "fix: 修复问题",
    value: "fix",
  },
  {
    name: "style: 风格改动",
    value: "style",
  },
  {
    name: "refactor: 代码重构",
    value: "refactor",
  },
  {
    name: "test: 测试代码",
    value: "test",
  },
  {
    name: "documentation: 文档",
    value: "docs",
  },
  {
    name: "chore: 杂项/工程依赖",
    value: "chore",
  },
];

/** 类型值 */
export const typeValues = types.map((item) => {
  return item.value;
});
