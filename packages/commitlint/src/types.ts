import type { UserConfig } from "czg";

/** 可选项 */
export interface Optional {
  name: string;
  value: string;
}

/** 插件选项 */
export interface PluginOptions {
  /** 自定义规则 */
  rules?: UserConfig["rules"];
  /** 扩展作用域 */
  scopes?: Optional[];
}
