import type { PluginOptions } from "./types";
import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";
import vuePlugin from "eslint-plugin-vue";
import prettierConfig from "eslint-config-prettier";
import perfectionistConfig from "./modules/perfectionist";

export default function (opts?: PluginOptions) {
  const { ignores = [], configs = [] } = opts || {};

  return defineConfig([
    globalIgnores(["**/node_modules", "**/dist", ...ignores]),

    // JS 最佳实践
    eslint.configs.recommended,

    // TS 最佳实践
    tsEslint.configs.recommended,
    tsEslint.configs.stylistic,

    // VUE 最佳实践
    vuePlugin.configs["flat/recommended"],
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

    // 排序最佳实践
    perfectionistConfig,

    // 格式化风格
    prettierConfig,

    // 自定义规则
    {
      rules: {
        // 统一使用完整写法，避免单行/多行的写法不同
        curly: ["error", "all"],
        "arrow-body-style": ["error", "always"],
        // 统一区分普通导入和类型导入
        "@typescript-eslint/consistent-type-imports": "error",

        // 关闭全局变量校验，交由 tsc 类型校验
        "no-undef": "off",
        // 关闭 vue 模板根节点校验，部分工具可能需要 vue sfc 但它没有子节点
        "vue/valid-template-root": "off",
        // 关闭 vue 组件名多单词校验，组件作为页面的情况可能是单单词
        "vue/multi-word-component-names": "off",
      },
    },

    ...configs,
  ]);
}
