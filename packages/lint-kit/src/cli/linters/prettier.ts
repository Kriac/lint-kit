/**
 * Prettier 配置文件的搜索优先级。
 */
export const prettierConfigSearchPlaces = [
  "package.json",
  "package.yaml",
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
  ".prettierrc.json5",
  ".prettierrc.js",
  "prettier.config.js",
  ".prettierrc.ts",
  "prettier.config.ts",
  ".prettierrc.mjs",
  "prettier.config.mjs",
  ".prettierrc.mts",
  "prettier.config.mts",
  ".prettierrc.cjs",
  "prettier.config.cjs",
  ".prettierrc.cts",
  "prettier.config.cts",
  ".prettierrc.toml",
];

/**
 * 构建 Prettier 的命令行参数，配置由 Prettier 按文件自行查找。
 */
export function buildPrettierArgs(files: string[], fix: boolean): string[] {
  return [
    fix ? "--write" : "--check",
    "--",
    ...(files.length > 0 ? files : ["."]),
  ];
}
