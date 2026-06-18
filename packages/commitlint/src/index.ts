import type { PluginOptions } from "./types";
import { defineConfig } from "czg";
import { types } from "./modules/czg-config";

export default function (opts?: PluginOptions) {
  const { scopes = [], rules = {} } = opts || {};

  return defineConfig({
    // 提交类型
    types,

    // 所属业务域
    scopes,

    // 配置 cli 跳过的问题
    skipQuestions: ["body", "breaking", "footerPrefix", "footer"],

    // 自定义规则
    rules: {
      // 每次提交必须要包含提交类型
      "type-empty": [2, "never"],
      // 提交的类型必须符合系统预设
      "type-enum": [
        2,
        "always",
        types.map((item) => {
          return item.value;
        }),
      ],

      ...rules,
    },
  });
}
