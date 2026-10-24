import { resolve } from "node:path";

/**
 * Commitlint 配置文件的搜索优先级。
 */
export const commitlintConfigSearchPlaces = [
  "package.json",
  "package.yaml",
  ".commitlintrc",
  ".commitlintrc.json",
  ".commitlintrc.yaml",
  ".commitlintrc.yml",
  ".commitlintrc.js",
  ".commitlintrc.cjs",
  ".commitlintrc.mjs",
  "commitlint.config.js",
  "commitlint.config.cjs",
  "commitlint.config.mjs",
  ".commitlintrc.ts",
  "commitlint.config.ts",
  ".commitlintrc.cts",
  "commitlint.config.cts",
  ".commitlintrc.mts",
  "commitlint.config.mts",
];

/**
 * 构建 Commitlint 的命令行参数。
 */
export function buildCommitlintArgs(
  configPath: string,
  cwd: string,
  commitlintFile: string | undefined,
): string[] {
  if (!commitlintFile) {
    throw new Error("--commitlint 需要指定提交信息文件");
  }
  return ["--config", configPath, "--edit", resolve(cwd, commitlintFile)];
}
