import type { UserConfig } from "czg";

/** 可选项 */
export interface Optional {
  name: string;
  value: string;
}

/** 插件选项 */
export interface PluginOptions {
  /** 扩展作用域 */
  scopes?: Optional[];
  /** 自定义规则 */
  rules?: UserConfig["rules"];
}
