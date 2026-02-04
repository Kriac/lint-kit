import type { Config } from "eslint/config";

/** 插件配置 */
export interface PluginOptions {
  /** 要忽略的文件或目录，默认忽略 node_modules 和 dist 目录 */
  ignores?: string[];
  /** 自定义扁平化配置 */
  configs?: Config[];
}
