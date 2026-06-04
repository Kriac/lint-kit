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

    // JS 最佳实践
    eslint.configs.recommended,

    // TS 最佳实践
    tsEslint.configs.recommended,
    tsEslint.configs.stylistic,

    // VUE 最佳实践
    vuePlugin.configs["flat/recommended"],

    // Vue SFC 解析器配置
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

    // Import Sort 配置
    ImportSortConfig,

    // 自定义规则
    {
      rules: {
        // 关闭全局变量校验，交由 tsc 校验
        "no-undef": "off",
        // 启用一致的类型导入，提升代码可读性和维护性
        "@typescript-eslint/consistent-type-imports": "error",
        // 关闭 vue 模板根节点校验，部分工具可能需要 vue sfc 并且没有子节点
        "vue/valid-template-root": "off",
        // 关闭 vue 组件名多单词校验，组件作为页面的情况可能是单单词
        "vue/multi-word-component-names": "off",
      },
    },

    // 自定义配置
    ...configs,

    // 格式化风格
    prettierConfig,
  ]);
}
