import { resolve } from "node:path";
import { stat } from "node:fs/promises";

/**
 * 解析命令的工作目录并确认它是目录，未指定时使用当前工作目录。
 */
export async function resolveCwd(directory?: string): Promise<string> {
  const cwd = resolve(directory ?? process.cwd());
  if (!(await stat(cwd)).isDirectory()) {
    throw new Error(`${cwd} 不是一个目录`);
  }
  return cwd;
}
