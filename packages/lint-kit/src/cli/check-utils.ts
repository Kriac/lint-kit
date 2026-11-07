import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { findConfigFile } from "./utils/config.ts";
import { buildEslintArgs, eslintConfigSearchPlaces } from "./linters/eslint.ts";
import {
  buildPrettierArgs,
  prettierConfigSearchPlaces,
} from "./linters/prettier.ts";
import {
  buildStylelintArgs,
  stylelintConfigSearchPlaces,
} from "./linters/stylelint.ts";
import {
  buildCommitlintArgs,
  commitlintConfigSearchPlaces,
} from "./linters/commitlint.ts";

/**
 * check 命令的工具选择、文件检查和提交信息文件选项。
 */
export interface CheckOptions {
  commitlint?: string;
  cwd?: string;
  eslint?: boolean;
  fix?: boolean;
  prettier?: boolean;
  stylelint?: boolean;
}

/**
 * check 命令支持的内置 lint 工具。
 */
export type Linter = "commitlint" | "eslint" | "prettier" | "stylelint";

const require = createRequire(import.meta.url);
const defaultLinters = ["prettier", "eslint", "stylelint"] as const;
const deferredExtensions = [
  "js",
  "mjs",
  "cjs",
  "ts",
  "mts",
  "cts",
  "json5",
  "toml",
];
const configSearchPlaces: Record<Linter, string[]> = {
  prettier: prettierConfigSearchPlaces,
  eslint: eslintConfigSearchPlaces,
  stylelint: stylelintConfigSearchPlaces,
  commitlint: commitlintConfigSearchPlaces,
};

/**
 * 根据显式选择或默认规则确定需要执行的 lint 工具。
 */
export function selectLinters(options: CheckOptions): Linter[] {
  const hasExplicitSelection =
    options.commitlint !== undefined ||
    defaultLinters.some((linter) => {
      return options[linter] === true;
    });
  const selectedLinters: Linter[] = defaultLinters.filter((linter) => {
    if (hasExplicitSelection) {
      return options[linter] === true;
    }
    return options[linter] !== false;
  });

  if (options.commitlint !== undefined) {
    selectedLinters.push("commitlint");
  }

  return selectedLinters;
}

/**
 * 按指定优先级查找配置路径，不在发现阶段执行 JS/TS 配置。
 */
export async function findConfigPath(
  linter: Linter,
  cwd: string,
): Promise<string | undefined> {
  return findConfigFile(
    linter,
    cwd,
    configSearchPlaces[linter],
    deferredExtensions,
  );
}

/**
 * 构建指定 lint 工具的 CLI 参数，无需检查时返回 undefined。
 */
export async function buildLinterArgs(
  linter: Linter,
  configPath: string | undefined,
  files: string[],
  cwd: string,
  options: CheckOptions,
): Promise<string[] | undefined> {
  if (!configPath) {
    return undefined;
  }

  switch (linter) {
    case "prettier":
      return buildPrettierArgs(files, options.fix === true);
    case "eslint":
      return buildEslintArgs(configPath, files, options.fix === true);
    case "stylelint":
      return buildStylelintArgs(configPath, files, cwd, options.fix === true);
    case "commitlint":
      return buildCommitlintArgs(configPath, cwd, options.commitlint);
  }
}

/**
 * 启动指定 lint 工具并返回退出码。
 */
export async function runLinter(
  linter: Linter,
  args: string[],
  cwd: string,
): Promise<number> {
  const binaryPath = await resolveBinaryPath(linter);

  return new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [binaryPath, ...args], {
      cwd,
      stdio: ["ignore", "inherit", "inherit"],
    });

    child.once("error", reject);
    child.once("close", (code) => {
      resolveExit(code ?? 1);
    });
  });
}

/**
 * 从 lint-kit 自身的依赖中定位工具的 CLI 入口。
 */
export async function resolveBinaryPath(linter: Linter): Promise<string> {
  const packageJsonPath = require.resolve(`${linter}/package.json`);
  const { bin } = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    bin: Record<string, string> | string;
  };
  const binaryPath = typeof bin === "string" ? bin : bin[linter];

  return resolve(dirname(packageJsonPath), binaryPath);
}
