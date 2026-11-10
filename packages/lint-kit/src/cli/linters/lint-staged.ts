/**
 * lint-staged 配置文件的搜索优先级。
 */
export const lintStagedConfigSearchPlaces = [
  "package.json",
  "package.yaml",
  "package.yml",
  ".lintstagedrc",
  ".lintstagedrc.json",
  ".lintstagedrc.yaml",
  ".lintstagedrc.yml",
  ...["mjs", "mts", "js", "ts", "cjs", "cts"].flatMap((extension) => {
    return [`.lintstagedrc.${extension}`, `lint-staged.config.${extension}`];
  }),
];

/**
 * lint-kit 默认检查的暂存文件类型。
 */
export const lintStagedDefaultPattern =
  "*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,css,scss,less,html,json,jsonc,json5,yaml,yml,md,mdx,graphql,gql}";
