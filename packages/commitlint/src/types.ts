import type { UserConfig } from "@commitlint/types";

/**
 * 插件选项
 */
export interface PluginOptions {
  /**
   * 自定义规则
   */
  rules?: UserConfig["rules"];
}
