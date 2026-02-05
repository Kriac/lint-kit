import type { PluginOptions } from "./types";
import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import prettierConfig from "eslint-config-prettier";
import ImportSortConfig from "./modules/import-sort";

export default function (opts?: PluginOptions) {
  const { ignores = [], configs = [] } = opts || {};

  return defineConfig([
    // 忽略文件配置
    globalIgnores(["**/node_modules", "**/dist", ...ignores]),

    // 文件解析器配置
    {
      files: ["**/*.vue", "**/*.tsx"],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: tsEslint.parser,
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },

    // JS 最佳实践
    eslint.configs.recommended,

    // TS 最佳实践
    tsEslint.configs.recommended,
    tsEslint.configs.stylistic,

    // VUE 最佳实践
    vuePlugin.configs["flat/recommended"],

    // 导入顺序最佳实践
    ImportSortConfig,

    // 自定义配置
    ...configs,

    // 自定义规则
    {
      rules: {
        // 全局变量校验 - 禁用原因: 全局变量交由 tsc 校验
        "no-undef": "off",
        // 空对象类型校验 - 禁用原因: 扩展接口时可能需要使用空对象类型
        "@typescript-eslint/no-empty-object-type": "off",
        // vue 组件名多单词校验 - 禁用原因: 组件作为页面的情况可能是单单词
        "vue/multi-word-component-names": "off",
      },
    },

    // 格式化风格
    prettierConfig,
  ]);
}
