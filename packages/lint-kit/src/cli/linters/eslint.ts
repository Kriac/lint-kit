/**
 * ESLint 配置文件的搜索优先级。
 */
export const eslintConfigSearchPlaces = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.cts",
];

/**
 * 构建 ESLint 的命令行参数，未指定目标时检查当前项目。
 */
export function buildEslintArgs(
  configPath: string,
  files: string[],
  fix: boolean,
): string[] {
  const targets = files.length > 0 ? files : ["."];
  const args = ["--config", configPath];
  if (fix) {
    args.push("--fix");
  }
  args.push("--", ...targets);
  return args;
}
