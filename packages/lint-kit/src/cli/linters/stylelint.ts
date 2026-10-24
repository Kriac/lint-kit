import { resolve } from "node:path";
import { stat } from "node:fs/promises";

const styleExtensions = ["css", "scss", "sass", "less", "styl", "vue", "html"];
const stylePattern = `**/*.{${styleExtensions.join(",")}}`;

/**
 * Stylelint 配置文件的搜索优先级。
 */
export const stylelintConfigSearchPlaces = [
  "package.json",
  ".stylelintrc",
  ".stylelintrc.json",
  ".stylelintrc.yaml",
  ".stylelintrc.yml",
  ".stylelintrc.js",
  ".stylelintrc.ts",
  ".stylelintrc.cjs",
  ".stylelintrc.mjs",
  ".config/stylelintrc",
  ".config/stylelintrc.json",
  ".config/stylelintrc.yaml",
  ".config/stylelintrc.yml",
  ".config/stylelintrc.js",
  ".config/stylelintrc.ts",
  ".config/stylelintrc.cjs",
  ".config/stylelintrc.mjs",
  "stylelint.config.js",
  "stylelint.config.ts",
  "stylelint.config.cjs",
  "stylelint.config.mjs",
];

/**
 * 将样式文件、目录和 glob 转为 Stylelint 检查目标。
 */
export async function resolveStyleTargets(
  files: string[],
  cwd: string,
): Promise<string[]> {
  if (files.length === 0) {
    return [stylePattern];
  }

  const targets: string[] = [];
  for (const file of files) {
    const absolutePath = resolve(cwd, file);
    const fileStats = await stat(absolutePath).catch(() => {
      return undefined;
    });
    // glob 使用正斜杠，文件系统检查仍使用上面的绝对路径。
    const pattern = file.replaceAll("\\", "/");
    if (fileStats?.isDirectory()) {
      targets.push(`${pattern.replace(/\/$/, "")}/${stylePattern}`);
      continue;
    }

    const isStyleFile = styleExtensions.some((extension) => {
      return file.endsWith(`.${extension}`);
    });
    // 无法 stat 的输入可能是 glob，交由 Stylelint 展开和处理。
    if (!fileStats || isStyleFile) {
      targets.push(pattern);
    }
  }
  return targets;
}

/**
 * 构建 Stylelint 的命令行参数；没有匹配目标时返回 undefined。
 */
export async function buildStylelintArgs(
  configPath: string,
  files: string[],
  cwd: string,
  fix: boolean,
): Promise<string[] | undefined> {
  const targets = await resolveStyleTargets(files, cwd);
  if (targets.length === 0) {
    return undefined;
  }

  const args = ["--config", configPath];
  if (fix) {
    args.push("--fix");
  }
  args.push("--allow-empty-input", "--", ...targets);
  return args;
}
