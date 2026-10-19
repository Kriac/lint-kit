import type { UserConfig } from "@commitlint/types";
import type { PluginOptions } from "./types";

/**
 * 创建提交信息校验配置
 */
export default function (opts?: PluginOptions): UserConfig {
  const { rules = {} } = opts || {};
  return {
    rules: {
      // 校验提交类型不能为空
      "type-empty": [2, "never"],
      // 校验提交类型必须符合 Conventional Commits 规范
      "type-enum": [
        2,
        "always",
        [
          "feat",
          "fix",
          "style",
          "refactor",
          "perf",
          "test",
          "ci",
          "docs",
          "chore",
          "revert",
        ],
      ],
      ...rules,
    },
  };
}
