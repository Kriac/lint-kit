import type { PluginOptions } from "./types";
import { defineConfig } from "czg";
import { types } from "./modules/czg-config";

export default function (opts?: PluginOptions) {
  const { scopes = [], rules = {} } = opts || {};

  return defineConfig({
    // 提交类型
    types,

    // 扩展范围
    scopes,

    // 跳过问题
    skipQuestions: ["body", "breaking", "footerPrefix", "footer"],

    // 扩展规则
    rules: {
      // 必须要定义类型
      "type-empty": [2, "never"],
      // 类型必须符合预设的类型
      "type-enum": [2, "always", types.map((item) => item.value)],

      // 自定义规则
      ...rules,
    },
  });
}
