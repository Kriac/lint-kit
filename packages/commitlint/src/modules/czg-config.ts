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
    name: "perf: 性能优化",
    value: "perf",
  },
  {
    name: "test: 测试代码",
    value: "test",
  },
  {
    name: "ci: 持续集成",
    value: "ci",
  },
  {
    name: "docs: 文档",
    value: "docs",
  },
  {
    name: "chore: 杂项/工程依赖",
    value: "chore",
  },
  {
    name: "revert: 回退",
    value: "revert",
  },
];
